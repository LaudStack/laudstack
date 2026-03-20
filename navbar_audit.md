# Navbar Audit — Root Cause Analysis

## 1. Avatar Flicker / Blink on Navigation

**Root Cause:** `useDbUser` hook uses plain `useState(null)` + `useEffect` with no persistence.
Every time the Navbar re-mounts (which happens on every page navigation in Next.js App Router
because Navbar is in the root layout), `useDbUser` resets `dbUser` to `null`, triggers a fresh
`getCurrentDbUser()` server action call, and the avatar disappears until the response returns.

The `useAuth` hook correctly uses `useSyncExternalStore` with a module-level cache so auth state
is stable. But `useDbUser` has NO equivalent — it starts from `null` every time.

**Fix:** Mirror the `useAuth` pattern — add a module-level cache for `dbUser` in `useDbUser`.
On first mount, if the cache already has data, initialize `useState` from the cache (no flash).
On fetch completion, update the cache. All Navbar instances share the same snapshot.

---

## 2. Dropdown Broken / Unreliable Click

**Root Cause (Primary):** The avatar dropdown div has `z-50` (z-index: 50). The header itself
has `z-50`. The dropdown is a child of the header, so it renders correctly. However, the
`overflow-hidden` class on the dropdown container (`rounded-xl overflow-hidden`) clips the
dropdown shadow but NOT the content — this is fine.

**Root Cause (Real):** The `mousedown` outside-click handler closes the dropdown. But the
dropdown items use `onClick` (fires after `mouseup`). The sequence is:
  1. User clicks a dropdown item → `mousedown` fires on the item
  2. The `mousedown` outside-click handler checks `avatarRef.current.contains(e.target)`
  3. Since the item IS inside `avatarRef`, the handler does NOT close the dropdown ✓
  4. `onClick` fires → `router.push()` + `setAvatarOpen(false)` ✓

This should work. BUT: the dropdown is rendered with `{avatarOpen && (...)}` — it only exists
in the DOM when `avatarOpen` is true. If `avatarOpen` becomes false BEFORE the click event
fires (e.g., due to a race condition or React batching), the dropdown unmounts and the click
is lost.

**Root Cause (Secondary — Mobile):** On mobile, the avatar button is inside the top bar which
has `z-50`. The dropdown has `z-50`. But the mobile menu overlay has `z-[90]`. If the mobile
menu is open and the user opens the avatar dropdown, the dropdown (z-50) is hidden BEHIND the
mobile overlay (z-90). Also, the avatar dropdown on mobile is positioned `absolute right-0
top-full` inside a `relative` container — but the mobile top bar may be clipped or have
`overflow-hidden` on a parent.

**Fix:**
- Raise dropdown z-index to `z-[200]` (above everything including search modal at z-[100])
- Use `onPointerDown` + `e.preventDefault()` on dropdown items to prevent the blur/mousedown
  sequence from closing the dropdown before the click registers
- Close mobile menu when avatar dropdown opens (they should be mutually exclusive)
- Add `overflow-visible` to the avatar container's parent chain on mobile

---

## 3. Duplicate Avatar Rendering Code (3 copies)

The Navbar has THREE separate avatar button implementations:
1. Homepage desktop top bar (lines ~307-430)
2. Non-homepage desktop top bar (lines ~604-720)
3. Mobile top bar (lines ~775-870)

All three are copy-pasted with slight style variations. This means any fix must be applied
in three places, and bugs are tripled. The dropdown logic, z-index, and click handling
are all duplicated.

**Fix:** Extract a single `<AvatarDropdown>` component used in all three locations.

---

## 4. `useDbUser` Refetches on Every Navigation

**Root Cause:** `useDbUser` has no module-level cache. The `tick` state starts at 0 on every
mount. The `useEffect` runs on mount and fetches from the server. Since Navbar is in the root
layout and Next.js App Router re-renders the layout on navigation, `useDbUser` fetches on
every page change.

**Fix:** Module-level cache (same pattern as `useAuth`). Fetch once, cache result, serve from
cache on subsequent mounts. Invalidate on sign-out.

---

## 5. `authLoading` Skeleton Still Shows Brief Flash

**Root Cause:** Even though `useAuth` uses `useSyncExternalStore`, the `_initialised` flag
means the first call to `_ensureInitialised()` happens inside a `useEffect` (which runs after
hydration). During SSR and the initial hydration frame, `_cache.resolved` is `false`, so
`authLoading` is `true` and the skeleton shows.

The `_serverSnapshot` returns `{ user: null, resolved: false }`, which means on the server
AND on the first client render, `authLoading = true`. This is correct for SSR safety, but
causes a brief skeleton flash even for logged-in users.

**Fix:** Call `_ensureInitialised()` at module load time (outside the hook), not inside
`useEffect`. This starts the `getUser()` call immediately when the module is imported,
reducing the window before `resolved` becomes `true`.

---

## 6. Mobile Menu and Avatar Dropdown Conflict

**Root Cause:** The mobile menu overlay has `z-[90]`. The avatar dropdown (in the mobile
top bar) has `z-50`. When the mobile menu is open, the avatar dropdown is hidden behind it.
Also, when the avatar dropdown is open, clicking the hamburger menu opens the mobile menu
on top of it without closing the dropdown first.

**Fix:** 
- Close `mobileOpen` when `avatarOpen` is set to true
- Close `avatarOpen` when `mobileOpen` is set to true
- Raise mobile avatar dropdown z-index to `z-[200]`

---

## 7. Missing `setMobileOpen(false)` Before Navigation

Several mobile menu items call `router.push()` + `setMobileOpen(false)` correctly.
But the avatar dropdown items inside the mobile top bar only call `router.push()` +
`setAvatarOpen(false)` — they do NOT close the mobile menu if it was open.

**Fix:** Add `setMobileOpen(false)` to all navigation handlers in the avatar dropdown.

---

## Summary of Fixes

| # | Issue | Fix |
|---|-------|-----|
| 1 | Avatar flicker on navigation | Module-level cache in `useDbUser` |
| 2 | Dropdown unreliable click | `onPointerDown` + `e.preventDefault()` on items |
| 3 | Duplicate code (3 copies) | Extract `<AvatarDropdown>` component |
| 4 | DB user refetch every navigation | Module-level cache in `useDbUser` |
| 5 | Auth skeleton flash | Call `_ensureInitialised()` at module load |
| 6 | Mobile menu/dropdown conflict | Mutual exclusion + z-index fix |
| 7 | Mobile menu not closed on nav | Add `setMobileOpen(false)` to dropdown items |
