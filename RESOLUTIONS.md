# Dependency Resolutions

This file documents forced dependency resolutions and their reasons.
The goal is to minimize resolutions and remove them when no longer needed.

## Active Resolutions

### uuid

- **Forced version**: `11.1.1`
- **Reason**: Buffer bounds issue in `uuid` (Dependabot alert, vulnerable `< 11.1.1`). uuid 11 still ships a CJS build exporting `.v4`, which is how `sockjs` consumes it, so it remains compatible.
- **Parent packages**: `sockjs` (via `webpack-dev-server`) — dev/build-time only. `sockjs` has no upstream release that widens the range.
- **Original selector**: `^8.3.2` (caps at 8.x, patch is the 11.x major)
- **Date added**: 2026-07-13
- **Can be removed when**: `sockjs` updates its `uuid` dependency to a non-vulnerable major, or removes the dependency.
