"""
Definitive motion removal script v3.
Uses a token-based approach to safely remove framer-motion from JSX files.

The key insight: framer-motion props in JSX look like:
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.3 }}
  variants={fadeUp}
  custom={i * 0.07}
  viewport={{ once: true }}

These can appear:
1. On their own line (easy to remove)
2. Inline with other props on the same line (need to extract just the prop)
3. As the only content on a line (remove the whole line)

Strategy: Process character by character to find and remove prop=value pairs
where the prop name is a known motion prop.
"""
import re, os, subprocess

MOTION_PROPS = {
    'initial', 'animate', 'exit', 'variants', 'whileHover', 'whileTap',
    'whileInView', 'viewport', 'custom', 'layoutId', 'transition',
    'whileDrag', 'drag', 'dragConstraints', 'dragElastic', 'dragMomentum',
    'onAnimationStart', 'onAnimationComplete',
}

def find_matching_brace(s, start):
    """Find the position after the matching closing brace for s[start] which should be '{'.
    Returns the index after the closing brace."""
    depth = 0
    i = start
    while i < len(s):
        if s[i] == '{':
            depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    return len(s)

def remove_motion_props_from_jsx(content):
    """Remove motion-specific props from JSX content."""
    result = []
    i = 0
    n = len(content)
    
    while i < n:
        # Look for a motion prop name followed by =
        # We need to be careful not to match inside strings or comments
        
        # Try to match a motion prop at position i
        matched = False
        for prop in MOTION_PROPS:
            if content[i:i+len(prop)] == prop:
                # Check it's followed by = (with optional whitespace)
                j = i + len(prop)
                while j < n and content[j] == ' ':
                    j += 1
                if j < n and content[j] == '=':
                    # Check this is actually a JSX prop (preceded by whitespace or newline)
                    if i == 0 or content[i-1] in ' \t\n':
                        # Found a motion prop! Remove it along with its value
                        j += 1  # skip =
                        # Skip whitespace
                        while j < n and content[j] == ' ':
                            j += 1
                        # Now j points to the value: either {expr} or "string"
                        if j < n and content[j] == '{':
                            end = find_matching_brace(content, j)
                        elif j < n and content[j] == '"':
                            end = content.index('"', j+1) + 1
                        elif j < n and content[j] == "'":
                            end = content.index("'", j+1) + 1
                        else:
                            # Bare value - find end
                            end = j
                            while end < n and content[end] not in ' \t\n>':
                                end += 1
                        
                        # Skip the prop=value
                        i = end
                        matched = True
                        break
        
        if not matched:
            result.append(content[i])
            i += 1
    
    return ''.join(result)

def process_file(filepath):
    with open(filepath) as f:
        content = f.read()
    
    original = content
    
    # Step 1: Remove framer-motion/motion import lines entirely
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if re.match(r"^import\s+\{[^}]+\}\s+from\s+['\"]framer-motion['\"];?$", stripped):
            continue
        if re.match(r"^import\s+\{[^}]+\}\s+from\s+['\"]motion/react['\"];?$", stripped):
            continue
        new_lines.append(line)
    content = '\n'.join(new_lines)
    
    # Step 2: Replace motion.X element tags
    elements = ['div', 'section', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'li', 'button', 'a', 'img', 'nav', 'header', 'footer',
                'article', 'aside', 'main', 'form', 'input', 'label', 'select',
                'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot']
    for elem in elements:
        content = content.replace(f'<motion.{elem} ', f'<{elem} ')
        content = content.replace(f'<motion.{elem}\n', f'<{elem}\n')
        content = content.replace(f'<motion.{elem}>', f'<{elem}>')
        content = content.replace(f'</motion.{elem}>', f'</{elem}>')
    
    # Step 3: Replace AnimatePresence
    content = re.sub(r'<AnimatePresence[^>]*>', '<>', content)
    content = content.replace('</AnimatePresence>', '</>')
    
    # Step 4: Remove motion props using token-based approach
    content = remove_motion_props_from_jsx(content)
    
    # Step 5: Clean up empty lines that resulted from removing props
    # Remove lines that are now just whitespace
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if line.strip() == '' and new_lines and new_lines[-1].strip() == '':
            continue  # Skip consecutive empty lines
        new_lines.append(line)
    content = '\n'.join(new_lines)
    
    return content, content != original


# Find files with motion
target_files = []
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.next')]
    for fname in files:
        if not fname.endswith(('.tsx', '.ts')):
            continue
        path = os.path.join(root, fname)
        with open(path) as f:
            c = f.read()
        if 'framer-motion' in c or 'motion/react' in c or 'motion.' in c:
            target_files.append(path)

print(f'Processing {len(target_files)} files...')
changed = 0
for filepath in target_files:
    new_content, was_changed = process_file(filepath)
    if was_changed:
        with open(filepath, 'w') as f:
            f.write(new_content)
        changed += 1
        print(f'  ✓ {filepath}')

print(f'\n✅ Fixed {changed} files')
