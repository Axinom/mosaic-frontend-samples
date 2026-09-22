# Dependency Resolutions

This file documents forced dependency resolutions and their reasons.
The goal is to minimize resolutions and remove them when no longer needed.

## Active Resolutions

### serialize-javascript

- **Forced version**: `7.0.5`
- **Reason**: RCE + DoS in `serialize-javascript` (Dependabot alerts, vulnerable `< 7.0.5`). `serialize()` API is stable across the 6 → 7 major bump.
- **Parent packages**: `terser-webpack-plugin`, `css-minimizer-webpack-plugin`, `@rollup/plugin-terser` — all build-time only.
- **Original selector**: `^6.0.0` / `^6.0.1` / `^6.0.2` (caps at 6.x, patch is the 7.x major)
- **Date added**: 2026-07-13
- **Can be removed when**: `css-minimizer-webpack-plugin` (direct dep, 3.x still `^6.0.0`; 8.x uses `^7.0.3` but needs Node >= 20.9) and `@rollup/plugin-terser` (0.4.x via `shaka-player-react`, 1.0.0 uses `^7.0.3`) both admit `^7`. `terser-webpack-plugin` 5.6.x no longer depends on `serialize-javascript` at all (checked 2026-09-22).

### uuid

- **Forced version**: `11.1.1`
- **Reason**: Buffer bounds issue in `uuid` (Dependabot alert, vulnerable `< 11.1.1`). uuid 11 still ships a CJS build exporting `.v4`, which is how `sockjs` consumes it, so it remains compatible.
- **Parent packages**: `sockjs` (via `webpack-dev-server`) — dev/build-time only. `sockjs` has no upstream release that widens the range.
- **Original selector**: `^8.3.2` (caps at 8.x, patch is the 11.x major)
- **Date added**: 2026-07-13
- **Can be removed when**: `sockjs` updates its `uuid` dependency to a non-vulnerable major, or removes the dependency.
