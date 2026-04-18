# UX improvement plan

Prioritized improvements for the Brew ATL frontend. Check items off as you complete them.

## Phase 1 — Quick wins

- [x] **Feedback** — Toast system (`ToastProvider` / `useToast` in `src/contexts/ToastContext.tsx`). Wired: login success, register success, logout success, map shop-detail load failure. _When profile/favorites/reviews UI exists:_ wire the same helpers there.
- [x] **Loading** — Map: spinner + “Loading shops…” + subtitle. Home preview: overlay “Loading map preview…”. _Profile/lists:_ apply when those routes exist.
- [x] **Destructive actions** — Reusable `ConfirmDialog` (`src/components/ConfirmDialog.tsx`) for confirmations. _Wire it to review delete (or similar) when that UI exists._

## Phase 2 — Navigation & clarity

- [ ] **Post-login** — Land on a clear default (e.g. map or profile) with minimal welcome if it fits.
- [ ] **Orientation** — Consistent page titles / hierarchy so profile vs map is obvious.

## Phase 3 — Empty & error states

- [ ] **Empty states** — One clear CTA (e.g. “Explore map”) for empty favorites and empty reviews.

## Phase 4 — Map & mobile

- [ ] **Touch & scroll** — Tune map gesture/scroll so the page doesn’t feel stuck on mobile.
- [ ] **Touch targets** — Aim for ~44px minimum for key controls (markers, close, primary actions).

## Phase 5 — Accessibility

- [ ] **Focus** — Visible focus rings for keyboard users through nav and forms.
- [ ] **Forms** — Labels linked to inputs (`htmlFor` / `id`); map popups close with Escape and return focus sensibly.

## Phase 6 — Polish

- [ ] **Microcopy** — Tighten buttons, errors (what happened + what to do), and success messages.
