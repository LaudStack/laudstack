"""
Remove inline motion props from JSX elements.
These are props that appear on the same line as the opening tag.
Pattern: initial={...} animate={...} exit={...} etc. on the same line.
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
        if any(prop in content for prop in ['initial={', 'animate={', 'exit={', 'variants={', 
                                              'whileHover={', 'whileTap={', 'whileInView={',
                                              'viewport={', 'custom={', 'layoutId=']):
            target_files.append(path)

print(f'Files with inline motion props: {len(target_files)}')

# Patterns to remove - these appear inline within JSX
INLINE_PROPS = [
    r'\s+initial=\{[^}]+\}',
    r'\s+animate=\{[^}]+\}',
    r'\s+exit=\{[^}]+\}',
    r'\s+variants=\{[^}]+\}',
    r'\s+whileHover=\{[^}]+\}',
    r'\s+whileTap=\{[^}]+\}',
    r'\s+whileInView=\{[^}]+\}',
    r'\s+viewport=\{[^}]+\}',
    r'\s+custom=\{[^}]+\}',
    r'\s+layoutId=\{[^}]+\}',
    r'\s+layoutId="[^"]*"',
    r"\s+layoutId='[^']*'",
    r'\s+layout\b(?!=)',  # layout prop but not layoutId or layout=
]

changed = 0
for filepath in target_files:
    with open(filepath) as f:
        content = f.read()
    
    new = content
    for pattern in INLINE_PROPS:
        new = re.sub(pattern, '', new)
    
    if new != content:
        with open(filepath, 'w') as f:
            f.write(new)
        changed += 1
        print(f'  Fixed: {filepath}')

print(f'\n✅ Fixed {changed} files')
