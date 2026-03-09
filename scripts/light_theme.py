#!/usr/bin/env python3
"""
Systematic dark-to-light theme conversion for LaudStack pages.
Replaces hardcoded dark Tailwind classes with light equivalents.
"""
import re
import os
import glob

# Mapping: dark class -> light equivalent
REPLACEMENTS = [
    # Page/section backgrounds
    ('bg-slate-950', 'bg-gray-50'),
    ('bg-slate-900', 'bg-white'),
    ('bg-slate-800', 'bg-gray-100'),
    ('bg-slate-700', 'bg-gray-200'),
    ('bg-gray-950', 'bg-gray-50'),
    ('bg-gray-900', 'bg-white'),
    ('bg-gray-800', 'bg-gray-100'),
    ('bg-zinc-950', 'bg-gray-50'),
    ('bg-zinc-900', 'bg-white'),
    ('bg-zinc-800', 'bg-gray-100'),

    # Text colors — dark text on light backgrounds
    ('text-slate-100', 'text-slate-900'),
    ('text-slate-200', 'text-slate-800'),
    ('text-slate-300', 'text-slate-600'),
    ('text-slate-400', 'text-slate-500'),
    ('text-slate-500', 'text-slate-500'),
    ('text-gray-100', 'text-gray-900'),
    ('text-gray-200', 'text-gray-800'),
    ('text-gray-300', 'text-gray-600'),
    ('text-gray-400', 'text-gray-500'),

    # Borders
    ('border-slate-800', 'border-gray-200'),
    ('border-slate-700', 'border-gray-300'),
    ('border-slate-600', 'border-gray-400'),
    ('border-gray-800', 'border-gray-200'),
    ('border-gray-700', 'border-gray-300'),

    # Input/form backgrounds
    ('bg-slate-800 border border-slate-700', 'bg-white border border-gray-300'),
    ('bg-slate-900 border border-slate-700', 'bg-white border border-gray-300'),
    ('bg-slate-900 border border-slate-800', 'bg-white border border-gray-200'),

    # Hover states on dark
    ('hover:bg-slate-800', 'hover:bg-gray-100'),
    ('hover:bg-slate-700', 'hover:bg-gray-200'),
    ('hover:bg-gray-800', 'hover:bg-gray-100'),
    ('hover:bg-gray-700', 'hover:bg-gray-200'),

    # Placeholder text
    ('placeholder-slate-500', 'placeholder-gray-400'),
    ('placeholder-slate-400', 'placeholder-gray-400'),

    # Focus states
    ('focus:border-amber-500', 'focus:border-amber-500'),  # keep amber focus

    # Opacity variants
    ('bg-slate-900/50', 'bg-gray-50/80'),
    ('bg-slate-900/80', 'bg-white/90'),
    ('bg-slate-800/50', 'bg-gray-100/80'),

    # text-white on dark backgrounds -> text-slate-900 on light
    # (only in page content, not buttons — we handle this carefully below)
]

# Files to process
PAGE_FILES = glob.glob('/home/ubuntu/laudstack/client/src/pages/*.tsx')
COMPONENT_FILES = [
    '/home/ubuntu/laudstack/client/src/components/Footer.tsx',
]

ALL_FILES = PAGE_FILES + COMPONENT_FILES

def convert_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    for old, new in REPLACEMENTS:
        content = content.replace(old, new)

    # Special: text-white inside className strings that are NOT buttons/badges
    # Replace text-white in headings/paragraphs/divs but keep in buttons
    # Strategy: replace "text-white" that appears with bg-slate or bg-gray dark contexts
    # Since we've already converted those bg classes, text-white on white bg is invisible
    # Replace text-white -> text-slate-900 EXCEPT when paired with bg-amber, bg-emerald, bg-red, bg-blue, bg-purple, bg-gradient
    # We do a safe replacement: any text-white NOT preceded by bg-amber/bg-emerald/bg-red/bg-blue/bg-purple on same line
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        # If line has text-white but no amber/colored button bg, convert it
        if 'text-white' in line:
            # Keep text-white if line has a colored button/badge background
            keep_white = any(x in line for x in [
                'bg-amber', 'bg-emerald', 'bg-red', 'bg-blue', 'bg-purple',
                'bg-green', 'bg-orange', 'bg-indigo', 'bg-teal', 'bg-cyan',
                'bg-gradient', 'ls-btn', 'bg-primary', 'bg-brand',
                'bg-rose', 'bg-violet', 'bg-fuchsia', 'bg-pink',
                'bg-yellow', 'bg-lime', 'bg-sky',
                # Keep for explicit dark sections like footer
                'bg-navy', 'bg-slate-950', 'bg-slate-900',
            ])
            if not keep_white:
                line = line.replace('text-white', 'text-slate-900')
        new_lines.append(line)
    content = '\n'.join(new_lines)

    # Fix: gradient text should still work
    content = content.replace('ls-gradient-text text-slate-900', 'ls-gradient-text')

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f'  Converted: {os.path.basename(filepath)}')
    else:
        print(f'  No changes: {os.path.basename(filepath)}')

print('Converting pages to light theme...')
for f in sorted(ALL_FILES):
    convert_file(f)
print('Done.')
