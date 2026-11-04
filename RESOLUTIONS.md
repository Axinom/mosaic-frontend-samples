# Dependency Resolutions

This file documents forced dependency resolutions and their reasons.
The goal is to minimize resolutions and remove them when no longer needed.

## Active Resolutions

### serialize-javascript

- **Forced version**: `7.1.4`
- **Reason**: RCE + DoS in `serialize-javascript` (Dependabot alerts, vulnerable `< 7.0.5`); bumped to `7.1.4` on 2026-11-03 for GHSA-m5mm-p8h7-m29v (vulnerable `< 7.1.3`). `serialize()` API is stable across the 6 → 7 major bump.
- **Parent packages**: `terser-webpack-plugin`, `css-minimizer-webpack-plugin`, `@rollup/plugin-terser` — all build-time only.
- **Original selector**: `^6.0.0` / `^6.0.1` / `^6.0.2` (caps at 6.x, patch is the 7.x major)
- **Date added**: 2026-07-13
- **Can be removed when**: `css-minimizer-webpack-plugin` (direct dep, 3.x still `^6.0.0`; 8.x uses `^7.0.3` but needs Node >= 20.9) and `@rollup/plugin-terser` (0.4.x via `shaka-player-react`, 1.0.0 uses `^7.0.3`) both admit `^7`. `terser-webpack-plugin` 5.6.x no longer depends on `serialize-javascript` at all (checked 2026-09-22; re-checked 2026-11-03, `css-minimizer-webpack-plugin` 3.4.1 still caps at `^6`).

### uuid

- **Forced version**: `11.1.1`
- **Reason**: Buffer bounds issue in `uuid` (Dependabot alert, vulnerable `< 11.1.1`). uuid 11 still ships a CJS build exporting `.v4`, which is how `sockjs` consumes it, so it remains compatible.
- **Parent packages**: `sockjs` (via `webpack-dev-server`) — dev/build-time only. `sockjs` has no upstream release that widens the range.
- **Original selector**: `^8.3.2` (caps at 8.x, patch is the 11.x major)
- **Date added**: 2026-07-13
- **Can be removed when**: `sockjs` updates its `uuid` dependency to a non-vulnerable major, or removes the dependency.

## Waiting for Upstream Fix

### deepmerge

- **Vulnerability**: Prototype poisoning in `mergeObject()` — GHSA-gcqx-w48m-w2h4 / CVE-2026-93753 (low, Dependabot alert #227). All versions `<= 4.3.1` are affected; 4.3.1 is the latest release, so no patched version exists.
- **Blocked by**: `deepmerge` itself needs to publish a fixed release. Current copies: 4.3.1 via `@svgr/webpack` → `@svgr/plugin-svgo`; 4.2.2 via `jest-config`, `fork-ts-checker-webpack-plugin` (via `react-dev-utils`), and `@rollup/plugin-node-resolve` (via `shaka-player-react` and `workbox-webpack-plugin` → `workbox-build`). All selectors are `^4.x`, so a 4.x patch would be picked up by deleting the lockfile entries.
- **Reachability**: build, test and dev tooling only. Not imported from `src/`, not in the production bundle, and only merges local configuration, never external input.
- **Date**: 2026-11-04
- **Check again when**: `deepmerge` publishes a version above 4.3.1 (`npm view deepmerge version`), or on the next monthly sweep.
