# Dependency Resolutions

This file documents forced dependency resolutions and their reasons.
The goal is to minimize resolutions and remove them when no longer needed.

## Active Resolutions

### qs

- **Forced version**: `6.15.2`
- **Reason**: Remotely triggerable DoS — `qs.stringify` crashes with a `TypeError` on null/undefined entries in comma-format arrays when `encodeValuesOnly` is set (Dependabot alert #151, medium). Vulnerable range `>= 6.11.1, <= 6.15.1`.
- **Parent packages**: `webpack-dev-server@5.2.4` → `express@4.22.1` and `body-parser@1.20.4`, both pinning `qs@~6.14.0`.
- **Original selector**: `~6.14.0` (does not allow the `6.15.2` patch).
- **Date added**: 2026-06-09
- **Can be removed when**: webpack-dev-server depends on `express@5` / `body-parser@2` (these use `qs@^6.14.x`, which admits `6.15.2`), or pulls express/body-parser versions whose `qs` range admits the patch naturally. Dev/build-time only — not shipped in the production bundle.

### serialize-javascript

- **Forced version**: `7.0.5`
- **Reason**: RCE via `RegExp.flags` and `Date.prototype.toISOString()` (alert #118, high, `<= 7.0.2`) and CPU-exhaustion DoS via crafted array-like objects (alert #150, medium, `< 7.0.5`).
- **Parent packages**: `css-minimizer-webpack-plugin@3.4.1` (`^6.0.0`) and `@rollup/plugin-terser@0.4.4` (`^6.0.1`, via `workbox-build@7.3.0`). Note: `terser-webpack-plugin@5.5.0+` already dropped its `serialize-javascript` dependency, so that path is clean.
- **Original selector**: `^6.0.0` / `^6.0.1` (do not allow the `7.x` patch).
- **Date added**: 2026-06-09
- **Can be removed when**: `css-minimizer-webpack-plugin` is updated to `>=8.0.0` (uses `serialize-javascript@^7.0.3`) and `workbox-build` ships a release using `@rollup/plugin-terser@^1.0.0`. Build-time only (minification) — operates on trusted project input, not shipped to the browser.

### uuid

- **Forced version**: `11.1.1`
- **Reason**: Missing buffer bounds check in v3/v5/v6 when `buf` is provided (alert #148, medium). Vulnerable range `< 11.1.1`.
- **Parent packages**: `webpack-dev-server@5.2.4` → `sockjs@0.3.24`, pinning `uuid@^8.3.2`.
- **Original selector**: `^8.3.2` (does not allow the `11.x` patch).
- **Date added**: 2026-06-09
- **Can be removed when**: `sockjs` releases a version whose `uuid` range admits `>=11.1.1` (none exists as of this date — `sockjs@latest` still pins `^8.3.2`). Compatibility verified: uuid@11.1.1 still ships a CommonJS build exporting `.v4`, which is how sockjs consumes it (`require('uuid').v4`). Dev-server only — not shipped in the production bundle, and sockjs uses `v4` without `buf`, so the vulnerable path is unreachable in practice.

## Ignored Vulnerabilities

_None._

## Waiting for Upstream Fix

_None._
