#!/usr/bin/env python3
"""
Fix remaining TypeScript errors - targeted fixes for specific files.
"""

import os
import re

def fix_file(filepath: str, fixes: list) -> bool:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    original = content
    for find, replace in fixes:
        content = content.replace(find, replace)
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


def fix_file_regex(filepath: str, fixes: list) -> bool:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    original = content
    for pattern, replace in fixes:
        content = re.sub(pattern, replace, content)
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


# Fix reviews/page.tsx - review.user.name is from mock data type, not Supabase User
reviews_fixes = [
    # Fix the initials computation - review.user has .name from mock data
    (
        "  const initials = review.user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'\n"
        "    ? review.user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()\n"
        "    : '??';",
        "  const initials = review.user?.name\n"
        "    ? review.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()\n"
        "    : '??';"
    ),
    # Fix the display name in the review card
    (
        "{review.user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User' ?? 'Anonymous'}",
        "{review.user?.name ?? 'Anonymous'}"
    ),
]

# Fix dashboard/founder/page.tsx - uses AuthContext user which has .name
founder_fixes = [
    (
        "user.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'",
        "user?.name || 'User'"
    ),
    (
        "user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'",
        "user?.name || 'User'"
    ),
]

# Fix page.tsx (home) - uses AuthContext user
home_fixes = [
    (
        "user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'",
        "user?.name || 'User'"
    ),
    (
        "user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'",
        "user?.name || 'User'"
    ),
]

# Fix templates/page.tsx - window.location.pathname.search issue
templates_fixes = [
    (
        "new URLSearchParams(window.location.pathname.search)",
        "new URLSearchParams(window.location.search)"
    ),
    (
        "window.location.pathname.pathname",
        "window.location.pathname"
    ),
]

# Fix blog/[slug]/page.tsx - navigate issue
blog_fixes = [
    (
        "navigate(",
        "router.push("
    ),
    # Fix .href on string
    (
        "window.location.pathname.href",
        "window.location.href"
    ),
]

# Fix || ?? mixing (need parentheses)
def fix_or_nullish(content: str) -> str:
    # Pattern: expr || expr ?? expr -> (expr || expr) ?? expr
    return re.sub(
        r'([^()\n]+)\s*\|\|\s*([^()\n??]+)\s*\?\?\s*',
        lambda m: f'({m.group(1)} || {m.group(2)}) ?? ',
        content
    )


files_to_fix = {
    "src/app/reviews/page.tsx": reviews_fixes,
    "src/app/dashboard/founder/page.tsx": founder_fixes,
    "src/app/page.tsx": home_fixes,
    "src/app/templates/page.tsx": templates_fixes,
    "src/app/blog/[slug]/page.tsx": blog_fixes,
}

changed = 0
for filepath, fixes in files_to_fix.items():
    if not os.path.exists(filepath):
        print(f"  SKIP (not found): {filepath}")
        continue
    if fix_file(filepath, fixes):
        changed += 1
        print(f"Fixed: {filepath}")

# Fix || ?? mixing in all pages
print("\nFixing || ?? mixing...")
for root, dirs, files in os.walk("src"):
    dirs[:] = [d for d in dirs if d not in ("node_modules", ".next")]
    for f in files:
        if not (f.endswith(".tsx") or f.endswith(".ts")):
            continue
        path = os.path.join(root, f)
        with open(path) as fp:
            content = fp.read()
        # Simple targeted fix for the specific pattern we see
        new = content.replace(
            "|| 'User' ?? 'Anonymous'",
            "|| 'Anonymous'"
        )
        new = new.replace(
            "|| 'User' ?? ''",
            "|| ''"
        )
        if new != content:
            with open(path, "w") as fp:
                fp.write(new)
            print(f"  Fixed || ?? in: {path}")
            changed += 1

print(f"\n✅ Fixed {changed} files total")
