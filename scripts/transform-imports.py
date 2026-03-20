#!/usr/bin/env python3
"""
Transform all page files from Manus/Vite/Wouter conventions to Next.js App Router conventions.

Changes made:
1. Add "use client"; at the top of every page file
2. Replace wouter imports with next/link and next/navigation
3. Replace @/_core/hooks/useAuth with @/hooks/useAuth
4. Replace @/contexts/AuthContext with @/hooks/useAuth
5. Fix useLocation → useRouter + usePathname patterns
6. Replace useParams from wouter with useParams from next/navigation
7. Fix import paths for shared components
"""

import os
import re
import sys

# Directories to process
TARGET_DIRS = [
    "/home/ubuntu/laudstack-next/src/app",
    "/home/ubuntu/laudstack-next/src/components",
    "/home/ubuntu/laudstack-next/src/hooks",
    "/home/ubuntu/laudstack-next/src/contexts",
]

# Files to skip
SKIP_FILES = {"layout.tsx", "globals.css"}

def transform_file(filepath: str) -> tuple[bool, list[str]]:
    """Transform a single file. Returns (changed, list_of_changes)."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    changes = []
    
    # 1. Add "use client" if not already present and not a server component
    if '"use client"' not in content and "'use client'" not in content:
        # Skip pure server files
        if not filepath.endswith("route.ts") and not filepath.endswith("layout.tsx"):
            content = '"use client";\n\n' + content
            changes.append("Added 'use client' directive")
    
    # 2. Fix wouter imports
    # import { useLocation, useParams, Link, Route, Switch } from 'wouter';
    # → import Link from 'next/link'; import { useRouter, useParams, usePathname } from 'next/navigation';
    
    wouter_pattern = r"import\s*\{([^}]+)\}\s*from\s*['\"]wouter['\"];"
    wouter_match = re.search(wouter_pattern, content)
    if wouter_match:
        imports_str = wouter_match.group(1)
        imports = [i.strip() for i in imports_str.split(",") if i.strip()]
        
        next_imports = []
        link_import = ""
        nav_imports = []
        
        for imp in imports:
            if imp == "Link":
                link_import = "import Link from 'next/link';"
            elif imp == "useLocation":
                nav_imports.append("useRouter")
                nav_imports.append("usePathname")
            elif imp == "useParams":
                nav_imports.append("useParams")
            elif imp == "useRoute":
                nav_imports.append("usePathname")
            # Skip Route, Switch - not needed in Next.js
        
        replacement_parts = []
        if link_import:
            replacement_parts.append(link_import)
        if nav_imports:
            # Deduplicate
            nav_imports = list(dict.fromkeys(nav_imports))
            replacement_parts.append(f"import {{ {', '.join(nav_imports)} }} from 'next/navigation';")
        
        if replacement_parts:
            content = re.sub(wouter_pattern, "\n".join(replacement_parts), content)
            changes.append(f"Replaced wouter imports: {imports} → {replacement_parts}")
        else:
            # Just remove the wouter import
            content = re.sub(wouter_pattern, "", content)
            changes.append("Removed wouter import (no used items)")
    
    # 3. Replace useLocation() usage
    # const [, navigate] = useLocation(); → const router = useRouter(); (and replace navigate with router.push)
    content = re.sub(
        r"const\s*\[,\s*navigate\]\s*=\s*useLocation\(\);",
        "const router = useRouter();",
        content
    )
    content = re.sub(
        r"const\s*\[location,\s*navigate\]\s*=\s*useLocation\(\);",
        "const router = useRouter();\n  const pathname = usePathname();",
        content
    )
    content = re.sub(
        r"const\s*\[location\]\s*=\s*useLocation\(\);",
        "const pathname = usePathname();",
        content
    )
    # Replace navigate( with router.push(
    content = re.sub(r"\bnavigate\(", "router.push(", content)
    # Replace location with pathname
    content = re.sub(r"\blocation\b(?!\s*=)", "pathname", content)
    
    if "router.push(" in content and "useLocation" not in original:
        pass  # Already handled
    
    # 4. Fix useParams from wouter
    # const { slug } = useParams(); → const params = useParams(); const slug = params.slug as string;
    content = re.sub(
        r"const\s*\{\s*(\w+)\s*\}\s*=\s*useParams\(\);",
        r"const params = useParams();\n  const \1 = params.\1 as string;",
        content
    )
    
    # 5. Replace Manus auth imports
    content = re.sub(
        r"import\s*\{\s*useAuth\s*\}\s*from\s*['\"]@/_core/hooks/useAuth['\"];",
        "import { useAuth } from '@/hooks/useAuth';",
        content
    )
    content = re.sub(
        r"import\s*\{\s*useAuth\s*\}\s*from\s*['\"]@/contexts/AuthContext['\"];",
        "import { useAuth } from '@/hooks/useAuth';",
        content
    )
    
    # 6. Replace trpc import from old location
    content = re.sub(
        r"import\s*\{\s*trpc\s*\}\s*from\s*['\"]@/lib/trpc['\"];",
        "import { trpc } from '@/lib/trpc/client';",
        content
    )
    
    # 7. Fix getLoginUrl import
    content = re.sub(
        r"import\s*\{[^}]*getLoginUrl[^}]*\}\s*from\s*['\"]@/const['\"];",
        "// getLoginUrl removed - use /auth/login directly",
        content
    )
    content = re.sub(r"\bgetLoginUrl\(\)", "'/auth/login'", content)
    
    # 8. Fix Supabase import
    content = re.sub(
        r"import\s*\{[^}]*supabase[^}]*\}\s*from\s*['\"]@/lib/supabase['\"];",
        "import { createBrowserClient } from '@/lib/supabase/client';",
        content
    )
    
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True, changes
    
    return False, []


def process_directory(dirpath: str):
    """Process all .tsx and .ts files in a directory recursively."""
    total_changed = 0
    for root, dirs, files in os.walk(dirpath):
        # Skip node_modules and .next
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".next", ".git")]
        for filename in files:
            if filename in SKIP_FILES:
                continue
            if not (filename.endswith(".tsx") or filename.endswith(".ts")):
                continue
            # Skip route files
            if filename == "route.ts":
                continue
            filepath = os.path.join(root, filename)
            changed, changes = transform_file(filepath)
            if changed:
                total_changed += 1
                print(f"✓ {filepath.replace('/home/ubuntu/laudstack-next/', '')}")
                for c in changes[:3]:  # Show first 3 changes
                    print(f"  - {c}")
    return total_changed


if __name__ == "__main__":
    print("Transforming imports for Next.js App Router...\n")
    total = 0
    for d in TARGET_DIRS:
        if os.path.exists(d):
            total += process_directory(d)
    print(f"\n✅ Transformed {total} files")
