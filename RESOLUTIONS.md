# Dependency Resolutions

This file documents forced dependency resolutions and their reasons.
The goal is to minimize resolutions and remove them when no longer needed.

## Active Resolutions

### qs

- **Forced version**: `6.15.2`
- **Reason**: Medium-severity DoS in `qs` `stringify` (GHSA / Dependabot alert). Patched in 6.15.2.
- **Parent packages**: `express` and `body-parser` (both pulled in via `webpack-dev-server`) — dev/build-time only, not shipped in the production browser bundle.
- **Original selector**: `~6.14.0` (caps at 6.14.x, so the 6.15.2 patch is out of range)
- **Date added**: 2026-07-13
- **Can be removed when**: `express` / `body-parser` widen their `qs` range to admit `>=6.15.2` (e.g. `~6.15.0` or `^6.15.0`).

### serialize-javascript

- **Forced version**: `7.0.5`
- **Reason**: RCE + DoS in `serialize-javascript` (Dependabot alerts, vulnerable `< 7.0.5`). `serialize()` API is stable across the 6 → 7 major bump.
- **Parent packages**: `terser-webpack-plugin`, `css-minimizer-webpack-plugin`, `@rollup/plugin-terser` — all build-time only.
- **Original selector**: `^6.0.0` / `^6.0.1` / `^6.0.2` (caps at 6.x, patch is the 7.x major)
- **Date added**: 2026-07-13
- **Can be removed when**: the terser/css-minimizer/rollup plugins update their `serialize-javascript` range to `^7`.

### uuid

- **Forced version**: `11.1.1`
- **Reason**: Buffer bounds issue in `uuid` (Dependabot alert, vulnerable `< 11.1.1`). uuid 11 still ships a CJS build exporting `.v4`, which is how `sockjs` consumes it, so it remains compatible.
- **Parent packages**: `sockjs` (via `webpack-dev-server`) — dev/build-time only. `sockjs` has no upstream release that widens the range.
- **Original selector**: `^8.3.2` (caps at 8.x, patch is the 11.x major)
- **Date added**: 2026-07-13
- **Can be removed when**: `sockjs` updates its `uuid` dependency to a non-vulnerable major, or removes the dependency.
