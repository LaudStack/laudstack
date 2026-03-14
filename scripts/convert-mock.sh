#!/bin/bash
# Batch replace MOCK_TOOLS/MOCK_REVIEWS imports with useToolsData hook
# This script handles the import replacement and adds the hook call

cd /home/ubuntu/laudstack-next

# Files to convert (each uses MOCK_TOOLS from mockData)
FILES=(
  "src/app/trending/page.tsx"
  "src/app/top-rated/page.tsx"
  "src/app/new-launches/page.tsx"
  "src/app/community-picks/page.tsx"
  "src/app/editors-picks/page.tsx"
  "src/app/launches/page.tsx"
)

for f in "${FILES[@]}"; do
  echo "Converting $f..."
  
  # Replace the import line
  sed -i "s|import { MOCK_TOOLS, CATEGORIES } from '@/lib/mockData';|import { CATEGORY_META } from '@/lib/categories';\nimport { useToolsData } from '@/hooks/useToolsData';\nimport type { Tool } from '@/lib/types';|g" "$f"
  sed -i "s|import { MOCK_TOOLS } from '@/lib/mockData';|import { useToolsData } from '@/hooks/useToolsData';\nimport type { Tool } from '@/lib/types';|g" "$f"
  
  # Replace MOCK_TOOLS with allTools (the hook variable)
  sed -i 's/MOCK_TOOLS/allTools/g' "$f"
  
  # Replace CATEGORIES with CATEGORY_META
  sed -i 's/\bCATEGORIES\b/CATEGORY_META/g' "$f"
  
  echo "  Done."
done

# Handle reviews page separately (uses both MOCK_REVIEWS and MOCK_TOOLS)
echo "Converting src/app/reviews/page.tsx..."
sed -i "s|import { MOCK_REVIEWS, MOCK_TOOLS } from '@/lib/mockData';|import { useToolsData } from '@/hooks/useToolsData';\nimport type { Tool, Review } from '@/lib/types';|g" "src/app/reviews/page.tsx"
sed -i 's/MOCK_TOOLS/allTools/g' "src/app/reviews/page.tsx"
sed -i 's/MOCK_REVIEWS/allReviews/g' "src/app/reviews/page.tsx"
echo "  Done."

# Handle compare page
echo "Converting src/app/compare/page.tsx..."
sed -i "s|import { MOCK_TOOLS } from '@/lib/mockData';|import { useToolsData } from '@/hooks/useToolsData';\nimport type { Tool } from '@/lib/types';|g" "src/app/compare/page.tsx"
sed -i 's/MOCK_TOOLS/allTools/g' "src/app/compare/page.tsx"
echo "  Done."

# Handle saved page
echo "Converting src/app/saved/page.tsx..."
sed -i "s|import { MOCK_TOOLS } from '@/lib/mockData';|import { useToolsData } from '@/hooks/useToolsData';\nimport type { Tool } from '@/lib/types';|g" "src/app/saved/page.tsx"
sed -i 's/MOCK_TOOLS/allTools/g' "src/app/saved/page.tsx"
echo "  Done."

echo ""
echo "All files converted. Now need to add useToolsData() hook call to each component."
