# Dependency Resolutions

This file documents forced dependency resolutions and their reasons.
The goal is to minimize resolutions and remove them when no longer needed.

## Active Resolutions

### serialize-javascript

- **Forced version**: `7.1.3`
- **Reason**: RCE + DoS fixes from `7.0.5`, plus the serialized-function XSS fix in `7.1.3` ([Dependabot #226](https://github.com/Axinom/mosaic-frontend-samples/security/dependabot/226)).
- **Parent packages**: `terser-webpack-plugin`, `css-minimizer-webpack-plugin`, `@rollup/plugin-terser` — all build-time only.
- **Original selector**: `^6.0.0` / `^6.0.1` / `^6.0.2` (caps at 6.x, patch is the 7.x major)
- **Date added**: 2026-07-13
- **Can be removed when**: `css-minimizer-webpack-plugin` (direct dep, 3.x still `^6.0.0`; 8.x uses `^7.0.3` but needs Node >= 20.9) and `@rollup/plugin-terser` (0.4.x via `shaka-player-react`, 1.0.0 uses `^7.0.3`) both admit `^7`. `terser-webpack-plugin` 5.6.x no longer depends on `serialize-javascript` at all (checked 2026-09-22).
- **Last updated**: 2026-11-04

### glob@npm:^13.0.0

- **Forced version**: `14.0.3` (only the `^13.0.0` selector; legacy `glob@7` is unchanged)
- **Reason**: [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), AbortSignal cancellation bypass during filesystem traversal.
- **Parent packages**: `cacache@20.0.3`, via `make-fetch-happen`.
- **Original selector**: `^13.0.0`
- **Date added**: 2026-11-04
- **Can be removed when**: `cacache` admits a patched `glob` release (`>=14.0.2`).
- **Verification**: Temporary-cache write, listing, and content verification passed with the override.

### uuid

- **Forced version**: `11.1.1`
- **Reason**: Buffer bounds issue in `uuid` (Dependabot alert, vulnerable `< 11.1.1`). uuid 11 still ships a CJS build exporting `.v4`, which is how `sockjs` consumes it, so it remains compatible.
- **Parent packages**: `sockjs` (via `webpack-dev-server`) — dev/build-time only. `sockjs` has no upstream release that widens the range.
- **Original selector**: `^8.3.2` (caps at 8.x, patch is the 11.x major)
- **Date added**: 2026-07-13
- **Can be removed when**: `sockjs` updates its `uuid` dependency to a non-vulnerable major, or removes the dependency.

## Waiting for Upstream Fix

### deepmerge

- **Vulnerability**: [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), prototype poisoning; low severity, affects `>=4.2.0 <=4.3.1`.
- **Blocked by**: No patched release is published; latest is `4.3.1`. Used by Jest, Rollup plugins, `@svgr/plugin-svgo`, and `fork-ts-checker-webpack-plugin`.
- **Date**: 2026-11-04
- **Decision**: Wait for upstream; keep [Dependabot #227](https://github.com/Axinom/mosaic-frontend-samples/security/dependabot/227) open.
- **Check again when**: A patched release is published and the affected parents can consume it.

### minimatch

- **Vulnerability**: [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), globparts amplification DoS; moderate severity, affects `<11.0.1`.
- **Blocked by**: Legacy consumers still require `3.x` or `5.x`, including ESLint and its plugins, `glob@7`, `filelist`, and `test-exclude`. Latest ESLint and filelist also do not yet admit `11.x`.
- **Date**: 2026-11-04
- **Attempted fix**: A user-approved global `11.0.1` override broke `test-exclude.shouldInstrument()` with `TypeError: minimatch is not a function`. Removed the incompatible override; coverage source selection passed afterward.
- **Check again when**: Patched legacy releases become available, or all affected parents migrate to the `11.x` API.
