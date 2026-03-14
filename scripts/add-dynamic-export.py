#!/usr/bin/env python3
"""
Add `export const dynamic = 'force-dynamic'` to all page.tsx files that
use client-side hooks (useState, useEffect, useRouter, useSearchParams, etc.)
but don't already have it.

This prevents Next.js from trying to statically pre-render these pages.
"""

import os
import re

HOOKS = [
    'useState', 'useEffect', 'useRouter', 'useSearchParams',
    'useParams', 'usePathname', 'useAuth', 'useContext',
    'useReducer', 'useRef', 'useCallback', 'useMemo',
]

DYNAMIC_EXPORT = "export const dynamic = 'force-dynamic';\n\n"

changed = 0
skipped = 0

for root, dirs, files in os.walk('src/app'):
    dirs[:] = [d for d in dirs if d not in ('.next', 'node_modules')]
    for fname in files:
        if fname != 'page.tsx':
            continue
        path = os.path.join(root, fname)
        with open(path) as f:
            content = f.read()
        
        # Only process files with "use client"
        if '"use client"' not in content:
            skipped += 1
            continue
        
        # Skip if already has dynamic export
        if "export const dynamic" in content:
            skipped += 1
            continue
        
        # Check if file uses any hooks
        uses_hooks = any(hook in content for hook in HOOKS)
        if not uses_hooks:
            skipped += 1
            continue
        
        # Insert after "use client" directive
        new_content = content.replace(
            '"use client";\n',
            '"use client";\n\n' + DYNAMIC_EXPORT,
            1
        )
        
        if new_content == content:
            # Try without semicolon
            new_content = content.replace(
                '"use client"\n',
                '"use client"\n\n' + DYNAMIC_EXPORT,
                1
            )
        
        if new_content != content:
            with open(path, 'w') as f:
                f.write(new_content)
            changed += 1
            print(f'  Added dynamic export: {path}')

print(f'\n✅ Added dynamic export to {changed} files, skipped {skipped}')
