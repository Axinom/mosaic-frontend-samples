# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## Unreleased

### Security

- Update dependencies to patched releases for 16 GitHub Dependabot alerts, including `serialize-javascript`, `fast-uri`, `body-parser`, `ip-address`, `launch-editor`, `follow-redirects`, `shell-quote`, `source-map-js`, `proxy-addr`, and `compression`.
- Fix additional recursive-audit findings in `diff`, `postcss-selector-parser`, `qs`, and `glob`; scope the `glob` override to the `^13.0.0` dependency selector.
- Document the unpatched `deepmerge` advisory and the `minimatch` upgrade blocked by incompatible legacy consumers in `RESOLUTIONS.md`.
