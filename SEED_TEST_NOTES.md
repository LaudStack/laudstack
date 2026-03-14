# Seed Test Notes

## Issue Found
The homepage shows "0 tools" in all categories and "No trending tools" / "No recent launches" despite having 44 tools in the database.

The homepage API at `/api/homepage` is likely filtering tools differently than expected, or the category counts are computed from a different source.

## Need to investigate:
1. `/api/homepage` route - how it queries tools
2. Category count computation
3. Whether the homepage uses the API data or mock data
