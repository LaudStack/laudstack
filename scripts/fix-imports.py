#!/usr/bin/env python3
"""
Fix broken multi-line imports caused by awk dedup.
The issue: `import {` was removed from multi-line imports when it was a duplicate.
Pattern to fix: a line ending with `} from 'something';` where the previous line
does NOT end with `{` or contain `import`.
"""
import re
import os
import glob

def fix_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    fixed = False
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check if this line looks like a continuation of a multi-line import
        # Pattern: starts with identifiers/spaces, ends with `} from "..." ;` or `} from '...' ;`
        if re.match(r'^\s+\w.*\}\s*from\s*["\']', stripped) or re.match(r'^\s*\w.*\}\s*from\s*["\']', stripped):
            # Check if previous line already has `import {` or ends with `{`
            if new_lines:
                prev = new_lines[-1].strip()
                # If previous line ends with a semicolon or is not part of an import block
                if not prev.endswith('{') and not prev.endswith(',') and 'import' not in prev:
                    # This is a broken import - add `import {` before this line
                    # Find the indentation
                    indent = ''
                    # Extract the from clause to build proper import
                    # The current line has: "  identifier1, identifier2, } from 'module';"
                    # We need: "import {\n  identifier1, identifier2,\n} from 'module';"
                    new_lines.append('import {\n')
                    new_lines.append(line)
                    fixed = True
                    i += 1
                    continue
        
        new_lines.append(line)
        i += 1
    
    if fixed:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)
        print(f"  FIXED: {filepath}")
    return fixed

# Find all .tsx and .ts files
files = []
for ext in ['tsx', 'ts']:
    files.extend(glob.glob(f'/home/ubuntu/laudstack-next/src/**/*.{ext}', recursive=True))

total_fixed = 0
for f in sorted(files):
    if fix_file(f):
        total_fixed += 1

print(f"\nFixed {total_fixed} files")
