"""
Safe motion removal script.
Strategy:
1. Replace the import line with nothing (removes the import)
2. Replace <motion.X with <X and </motion.X> with </X>
3. Replace <AnimatePresence> with <> and </AnimatePresence> with </>
4. Remove motion-specific props ONLY when they appear on their own line
   (i.e., lines that contain ONLY the prop assignment, with optional leading whitespace)
"""
import re, os

target_files = []
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.next')]
    for fname in files:
        if not fname.endswith(('.tsx', '.ts')):
            continue
        path = os.path.join(root, fname)
        with open(path) as f:
            content = f.read()
        if 'framer-motion' in content or 'motion/react' in content:
            target_files.append(path)

MOTION_ELEMENTS = [
    'div', 'section', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'button', 'a', 'img', 'nav', 'header', 'footer',
    'article', 'aside', 'main', 'form', 'input', 'label', 'select',
    'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot',
]

# Motion-specific prop patterns (only when on their own line)
MOTION_PROP_PATTERNS = [
    r'^\s+initial=\{[^}]+\}\s*$',
    r'^\s+animate=\{[^}]+\}\s*$',
    r'^\s+exit=\{[^}]+\}\s*$',
    r'^\s+variants=\{[^}]+\}\s*$',
    r'^\s+whileHover=\{[^}]+\}\s*$',
    r'^\s+whileTap=\{[^}]+\}\s*$',
    r'^\s+whileInView=\{[^}]+\}\s*$',
    r'^\s+transition=\{[^}]+\}\s*$',
    r'^\s+custom=\{[^}]+\}\s*$',
    r'^\s+viewport=\{[^}]+\}\s*$',
    r'^\s+layout\s*$',
    r'^\s+layoutId=\{[^}]+\}\s*$',
    r'^\s+layoutId="[^"]+"\s*$',
    r'^\s+layoutId=\'[^\']+\'\s*$',
]

changed = 0
for filepath in target_files:
    with open(filepath) as f:
        content = f.read()
    
    new = content
    
    # 1. Remove import lines
    new = re.sub(r"^import \{[^}]+\} from 'framer-motion';\n", '', new, flags=re.MULTILINE)
    new = re.sub(r'^import \{[^}]+\} from "framer-motion";\n', '', new, flags=re.MULTILINE)
    new = re.sub(r"^import \{[^}]+\} from 'motion/react';\n", '', new, flags=re.MULTILINE)
    new = re.sub(r'^import \{[^}]+\} from "motion/react";\n', '', new, flags=re.MULTILINE)
    
    # 2. Replace motion element tags
    for elem in MOTION_ELEMENTS:
        new = new.replace(f'<motion.{elem} ', f'<{elem} ')
        new = new.replace(f'<motion.{elem}\n', f'<{elem}\n')
        new = new.replace(f'<motion.{elem}>', f'<{elem}>')
        new = new.replace(f'</motion.{elem}>', f'</{elem}>')
    
    # 3. Replace AnimatePresence
    new = re.sub(r'<AnimatePresence[^>]*>', '<>', new)
    new = new.replace('</AnimatePresence>', '</>')
    
    # 4. Remove motion-specific props (only on their own line)
    lines = new.split('\n')
    filtered_lines = []
    for line in lines:
        skip = False
        for pattern in MOTION_PROP_PATTERNS:
            if re.match(pattern, line):
                skip = True
                break
        if not skip:
            filtered_lines.append(line)
    new = '\n'.join(filtered_lines)
    
    if new != content:
        with open(filepath, 'w') as f:
            f.write(new)
        changed += 1
        print(f'Fixed: {filepath}')

print(f'\n✅ Fixed {changed} files')
