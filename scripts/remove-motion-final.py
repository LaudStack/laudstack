"""
Final motion removal script.
Uses a line-by-line approach that:
1. Removes import lines for framer-motion/motion
2. Replaces <motion.X> tags with <X>
3. Removes lines that contain ONLY motion-specific props
   (handles double-brace {{ }} syntax correctly by checking if after removing
   known motion prop patterns, the line is empty)
"""
import re, os

def remove_motion_from_file(filepath):
    with open(filepath) as f:
        content = f.read()
    
    original = content
    
    # Step 1: Remove import lines
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        # Skip framer-motion/motion import lines
        if re.match(r"^import \{[^}]+\} from ['\"]framer-motion['\"];?$", line.strip()):
            continue
        if re.match(r"^import \{[^}]+\} from ['\"]motion/react['\"];?$", line.strip()):
            continue
        new_lines.append(line)
    content = '\n'.join(new_lines)
    
    # Step 2: Replace motion element tags
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
    
    # Step 4: Remove lines that contain ONLY motion props
    # Strategy: for each line, try to remove all motion prop patterns.
    # If the result is empty (or just whitespace), the line was only motion props.
    
    MOTION_PROP_NAMES = ['initial', 'animate', 'exit', 'variants', 'whileHover', 
                          'whileTap', 'whileInView', 'viewport', 'custom', 'layoutId',
                          'transition']
    
    def strip_motion_props_from_line(line):
        """Remove motion prop assignments from a line. Returns cleaned line."""
        result = line
        for prop in MOTION_PROP_NAMES:
            # Match prop={{ ... }} (double brace - object literal)
            # We need to handle nested braces properly
            # Pattern: propName={{ content }}
            # Use a simple state machine to find matching }}
            pattern = re.compile(rf'\b{prop}=\{{')
            while True:
                m = pattern.search(result)
                if not m:
                    break
                start = m.start()
                # Find the matching closing }}
                pos = m.end()  # position after the opening {{
                depth = 2  # we've consumed {{
                end = pos
                while end < len(result) and depth > 0:
                    if result[end] == '{':
                        depth += 1
                    elif result[end] == '}':
                        depth -= 1
                    end += 1
                # Remove from start to end, including any leading whitespace
                to_remove = result[start:end]
                result = result[:start] + result[end:]
            
            # Also match prop={expr} (single brace)
            pattern2 = re.compile(rf'\b{prop}=\{{')
            # Already handled above
        
        # Remove standalone 'layout' prop (not layoutId)
        result = re.sub(r'\blayout(?!Id)\b', '', result)
        
        return result
    
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        cleaned = strip_motion_props_from_line(line)
        if cleaned.strip() == '':
            # Line only had motion props
            pass
        else:
            new_lines.append(cleaned)
    
    content = '\n'.join(new_lines)
    
    return content, content != original


# Process all files
changed = 0
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.next')]
    for fname in files:
        if not fname.endswith(('.tsx', '.ts')):
            continue
        path = os.path.join(root, fname)
        with open(path) as f:
            orig = f.read()
        if 'framer-motion' not in orig and 'motion/react' not in orig and 'motion.' not in orig:
            continue
        
        new_content, was_changed = remove_motion_from_file(path)
        if was_changed:
            with open(path, 'w') as f:
                f.write(new_content)
            changed += 1
            print(f'  Fixed: {path}')

print(f'\n✅ Fixed {changed} files')
