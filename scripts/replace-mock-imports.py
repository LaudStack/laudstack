#!/usr/bin/env python3
"""
Safely replace mock data imports with real data hooks.
This script:
1. Replaces `import { MOCK_TOOLS } from '@/lib/mockData'` with useToolsData hook import
2. Replaces `import { MOCK_TOOLS, CATEGORIES } from '@/lib/mockData'` similarly
3. Replaces `import { MOCK_REVIEWS, MOCK_TOOLS } from '@/lib/mockData'` similarly
4. Replaces MOCK_TOOLS references with allTools
5. Replaces MOCK_REVIEWS references with allReviews (only in files that imported it)
6. Replaces CATEGORIES references with CATEGORY_META
7. Adds useToolsData() hook call after the export default function line
"""
import re
import os

# Files to convert and their specific needs
FILES = {
    # (file_path, needs_reviews, needs_categories, function_name)
    "src/app/page.tsx": (False, True, "Home"),
    "src/app/search/page.tsx": (False, True, "SearchResults"),
    "src/app/trending/page.tsx": (False, False, "Trending"),
    "src/app/top-rated/page.tsx": (False, False, "TopRated"),
    "src/app/new-launches/page.tsx": (False, True, "NewLaunches"),
    "src/app/community-picks/page.tsx": (False, True, "CommunityPicks"),
    "src/app/editors-picks/page.tsx": (False, False, "EditorsPicks"),
    "src/app/launches/page.tsx": (False, False, "Launches"),
    "src/app/reviews/page.tsx": (True, False, "ReviewsPage"),
    "src/app/compare/page.tsx": (False, False, "Compare"),
    "src/app/saved/page.tsx": (False, False, "Saved"),
    "src/app/claim/page.tsx": (False, False, "ClaimTool"),
    "src/app/tools/page.tsx": (False, False, "ToolsPage"),
    "src/app/tools/[slug]/page.tsx": (True, False, "ToolDetail"),
    "src/app/dashboard/page.tsx": (True, False, "Dashboard"),
    "src/app/dashboard/founder/page.tsx": (True, False, "FounderDashboard"),
}

BASE = "/home/ubuntu/laudstack-next"

for rel_path, (needs_reviews, needs_categories, func_name) in FILES.items():
    filepath = os.path.join(BASE, rel_path)
    if not os.path.exists(filepath):
        print(f"  SKIP (not found): {rel_path}")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Step 1: Replace the import line(s)
    # Pattern: import { MOCK_TOOLS, CATEGORIES } from '@/lib/mockData';
    # or: import { MOCK_TOOLS } from '@/lib/mockData';
    # or: import { MOCK_REVIEWS, MOCK_TOOLS } from '@/lib/mockData';
    
    import_patterns = [
        r"import\s*\{\s*MOCK_TOOLS\s*,\s*CATEGORIES\s*\}\s*from\s*['\"]@/lib/mockData['\"];?\n?",
        r"import\s*\{\s*MOCK_REVIEWS\s*,\s*MOCK_TOOLS\s*\}\s*from\s*['\"]@/lib/mockData['\"];?\n?",
        r"import\s*\{\s*MOCK_TOOLS\s*,\s*MOCK_REVIEWS\s*\}\s*from\s*['\"]@/lib/mockData['\"];?\n?",
        r"import\s*\{\s*MOCK_TOOLS\s*\}\s*from\s*['\"]@/lib/mockData['\"];?\n?",
        r"import\s*\{\s*MOCK_REVIEWS\s*\}\s*from\s*['\"]@/lib/mockData['\"];?\n?",
    ]
    
    # Build replacement imports
    new_imports = []
    new_imports.append("import { useToolsData } from '@/hooks/useToolsData';")
    if needs_categories:
        new_imports.append("import { CATEGORY_META } from '@/lib/categories';")
    
    replacement = "\n".join(new_imports) + "\n"
    
    for pattern in import_patterns:
        content = re.sub(pattern, replacement, content, count=1)
        # Only replace once - break after first match
        if content != original:
            break
    
    # Step 2: Replace MOCK_TOOLS with allTools
    content = content.replace('MOCK_TOOLS', 'allTools')
    
    # Step 3: Replace MOCK_REVIEWS with allReviews (only for files that need it)
    if needs_reviews:
        content = content.replace('MOCK_REVIEWS', 'allReviews')
    
    # Step 4: Replace CATEGORIES with CATEGORY_META (only for files that need it)
    if needs_categories:
        # Use word boundary to avoid replacing partial matches
        content = re.sub(r'\bCATEGORIES\b', 'CATEGORY_META', content)
    
    # Step 5: Fix typeof allTools[0] to Tool type
    content = content.replace('typeof allTools[0]', 'Tool')
    
    # Step 6: Add useToolsData() hook call after export default function
    hook_call = f"  const {{ tools: allTools, reviews: allReviews, loading: toolsLoading }} = useToolsData();"
    
    # Find the function declaration and add hook after it
    func_pattern = rf"(export default function {func_name}\([^)]*\)\s*\{{)"
    match = re.search(func_pattern, content)
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + "\n" + hook_call + "\n" + content[insert_pos:]
    else:
        print(f"  WARNING: Could not find function {func_name} in {rel_path}")
    
    # Step 7: Ensure 'use client' is at the top if not already
    if "'use client'" not in content[:50] and '"use client"' not in content[:50]:
        content = '"use client";\n\n' + content
    
    # Step 8: Add React import if useEffect is used but React is not imported
    if 'useEffect' in content and 'import React' not in content and "import { useEffect" not in content:
        # Add useEffect import
        content = content.replace("import { useState,", "import { useState, useEffect,", 1)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  CONVERTED: {rel_path}")
    else:
        print(f"  NO CHANGE: {rel_path}")

print("\nDone! Now also need to update Navbar search.")
