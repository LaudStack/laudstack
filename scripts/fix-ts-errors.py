#!/usr/bin/env python3
"""
Fix remaining TypeScript errors in the Next.js migration.

Issues to fix:
1. window.pathname → window.location.pathname
2. navigate( → router.push( (leftover from wouter)
3. user.name → user.user_metadata?.full_name || user.email (Supabase User type)
4. Missing 'navigate' variable → add router declaration
"""

import os
import re

TARGET_DIRS = [
    "/home/ubuntu/laudstack-next/src/app",
    "/home/ubuntu/laudstack-next/src/components",
]

def fix_file(filepath: str) -> bool:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    
    # 1. Fix window.pathname → window.location.pathname
    content = content.replace("window.pathname", "window.location.pathname")
    
    # 2. Fix leftover `navigate(` that wasn't caught (when useLocation was not imported)
    # Only if 'navigate' is used but not declared
    if "navigate(" in content and "const router" not in content and "useRouter" not in content:
        # Add router import and declaration
        content = re.sub(
            r"(import\s*\{[^}]*\}\s*from\s*'next/navigation';)",
            lambda m: m.group(0) if "useRouter" in m.group(0) else m.group(0).replace("}", ", useRouter}"),
            content,
            count=1
        )
        # Add router declaration after function opening
        content = re.sub(
            r"(export default function \w+[^{]*\{)",
            r"\1\n  const router = useRouter();",
            content,
            count=1
        )
    
    # 3. Replace navigate( with router.push( where router exists
    if "router.push(" not in content and "navigate(" in content and "const router" in content:
        content = content.replace("navigate(", "router.push(")
    
    # 4. Fix user.name → user.user_metadata?.full_name || user.email?.split('@')[0]
    # This is for Supabase User type which doesn't have .name
    content = re.sub(
        r"user\.name\b(?!\s*:)",  # Don't replace in type annotations
        "user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'",
        content
    )
    
    # 5. Fix user?.name
    content = re.sub(
        r"user\?\.name\b(?!\s*:)",
        "user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'",
        content
    )
    
    # 6. Fix { name: string; email: string } type issues with Supabase User
    # These are in dashboard pages that try to use user as a simple object
    # Replace with user?.user_metadata?.full_name
    
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


def main():
    changed = 0
    for d in TARGET_DIRS:
        for root, dirs, files in os.walk(d):
            dirs[:] = [x for x in dirs if x not in ("node_modules", ".next")]
            for f in files:
                if not (f.endswith(".tsx") or f.endswith(".ts")):
                    continue
                if f in ("route.ts", "layout.tsx"):
                    continue
                path = os.path.join(root, f)
                if fix_file(path):
                    changed += 1
                    print(f"Fixed: {path.replace('/home/ubuntu/laudstack-next/', '')}")
    print(f"\n✅ Fixed {changed} files")


if __name__ == "__main__":
    main()
