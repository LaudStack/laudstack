#!/usr/bin/env python3
"""
Standardize max-width to 1300px across all LaudStack pages.
Also fix remaining dark bg classes that slipped through.
"""
import os
import glob

FILES = (
    glob.glob('/home/ubuntu/laudstack/client/src/pages/*.tsx') +
    glob.glob('/home/ubuntu/laudstack/client/src/components/*.tsx')
)

REPLACEMENTS = [
    # Max-width standardization
    ('max-w-7xl', 'max-w-[1300px]'),
    ('max-w-6xl', 'max-w-[1300px]'),
    ('max-w-5xl', 'max-w-[1300px]'),
    ('max-w-screen-xl', 'max-w-[1300px]'),
    # Keep max-w-4xl and smaller for content columns (prose, forms, etc.)

    # Remaining dark backgrounds
    ('bg-slate-950', 'bg-gray-50'),
    ('bg-slate-900', 'bg-white'),
    ('bg-slate-800', 'bg-gray-100'),
    ('bg-gray-950', 'bg-gray-50'),
    ('bg-gray-900', 'bg-white'),
    ('bg-gray-800', 'bg-gray-100'),

    # Dark text that became invisible after bg conversion
    ('text-slate-100', 'text-slate-900'),
    ('text-slate-200', 'text-slate-800'),
    ('text-gray-100', 'text-gray-900'),
    ('text-gray-200', 'text-gray-800'),

    # Dark borders
    ('border-slate-800', 'border-gray-200'),
    ('border-slate-700', 'border-gray-300'),
    ('border-gray-800', 'border-gray-200'),
    ('border-gray-700', 'border-gray-300'),

    # Dark hover states
    ('hover:bg-slate-800', 'hover:bg-gray-100'),
    ('hover:bg-slate-700', 'hover:bg-gray-200'),
    ('hover:bg-gray-800', 'hover:bg-gray-100'),
    ('hover:bg-gray-700', 'hover:bg-gray-200'),

    # Opacity dark variants
    ('bg-slate-900/50', 'bg-gray-50/80'),
    ('bg-slate-900/80', 'bg-white/90'),
    ('bg-slate-800/50', 'bg-gray-100/80'),
    ('bg-slate-800/30', 'bg-gray-100/60'),
]

def process(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    original = content

    for old, new in REPLACEMENTS:
        content = content.replace(old, new)

    # Fix text-white on non-colored backgrounds
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if 'text-white' in line:
            keep = any(x in line for x in [
                'bg-amber', 'bg-emerald', 'bg-red', 'bg-blue', 'bg-purple',
                'bg-green', 'bg-orange', 'bg-indigo', 'bg-teal', 'bg-cyan',
                'bg-gradient', 'bg-primary', 'bg-rose', 'bg-violet',
                'bg-fuchsia', 'bg-pink', 'bg-yellow', 'bg-lime', 'bg-sky',
                'style=', 'gradient', 'text-white shrink-0',  # avatar initials
                'text-white font-black',  # avatar
            ])
            if not keep:
                line = line.replace('text-white', 'text-slate-900')
        new_lines.append(line)
    content = '\n'.join(new_lines)

    # Restore gradient text class that may have been broken
    content = content.replace('ls-gradient-text text-slate-900', 'ls-gradient-text')

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f'  Updated: {os.path.basename(filepath)}')
    else:
        print(f'  No change: {os.path.basename(filepath)}')

print('Standardizing max-width and fixing remaining dark classes...')
for f in sorted(FILES):
    process(f)
print('Done.')
