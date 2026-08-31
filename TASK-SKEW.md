# TASK-SKEW — Kill all text skew (user-facing bug)

**User bug report:** the chapter text goes CROOKED while scrolling. Fix it completely.

**Repo:** /home/ubuntu/living-bank-app (branch `main`)

## Root cause (already located)
Two sources of text skew, both applied to COPY (narrative text) containers:

1. `components/motion/VelocitySkew.tsx` — wraps chapter copy columns in S1Island, S2Gate, (check all scenes) and sets `skewY` on scroll velocity. See usages: `grep VelocitySkew components/scenes/*.tsx`.
2. `components/motion/KineticText.tsx` — line ~45/93: applies velocity-reactive `skewY` to text itself.

## Fix rules
1. **Text NEVER skews.** Remove `<VelocitySkew>` wrappers from all text/copy containers in every scene that uses them (keep the component file but make it a passthrough OR apply only to images/canvas/graphics with max 0.4°, above a threshold — simplest correct fix: remove usages on text entirely).
2. `KineticText.tsx`: delete the skewY logic (lines around 45 and 93); keep its other reveal behaviors (per-char rise etc.).
3. Search the whole repo for any other `skewY`/`skew(` applied to elements containing text — remove those too.
4. Do NOT change anything else. No redesign, no copy changes, no new features.

## Gates
- `npx tsc --noEmit` → 0 errors.
- Quick sanity: `grep -rn "skewY" components/ | grep -v node_modules` shows no skew applied to text containers (only inert definitions/passthrough or non-text graphics ≤0.4°).
- Commit locally with message "fix(motion): remove all text skew (velocity skew never on copy)". Do NOT push, do NOT build on the VPS (Cloudflare builds on push; Hermes will push).

Report: list of files changed and each skew usage removed.
