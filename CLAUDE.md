# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn install          # Install dependencies
yarn dev              # Start development server (port 3000)
yarn build            # Production build
yarn test             # Run tests in watch mode
yarn test:ci          # Run tests once (CI mode)
```

Run a single test file:
```bash
yarn test -- --testPathPattern="<filename>"
```

Lint is enforced via ESLint during webpack builds (dev and CI). To run manually:
```bash
npx eslint src --ext .ts,.tsx
```

## Architecture

This is a **React 17 + TypeScript** app that serves as a living collection of code samples demonstrating Mosaic microservice integrations. The user browses and runs individual "scenarios" from a host shell UI.

### Scenario System

The core pattern:
1. **[src/scenario-registry.ts](src/scenario-registry.ts)** — Central array registering all scenarios. Each entry has `groupName`, `shortId`, `displayName`, `displayOrder`, and `rootComponent`.
2. **[src/index.tsx](src/index.tsx)** — Passes the scenario array into `<ScenarioHostApp />` from `@axinom/mosaic-fe-samples-host`.
3. **ScenarioHost** (external package) — Renders the selected scenario and provides context via the `useScenarioHost()` hook, which exposes `activeProfile` (service endpoints/config), `logger`, `setVariable`, and `getVariable`.

Adding a new scenario means: create a component under `src/scenarios/<group>/`, register it in `scenario-registry.ts`.

### Scenario Component Structure

Each scenario follows a container/content split:

```
src/scenarios/<group>/<ScenarioName>/
  <ScenarioName>.tsx        # Container: wraps with providers (Apollo, UserServiceProvider, etc.)
  <ScenarioName>Content.tsx # Presentational: uses hooks, renders UI
```

The container sets up `ApolloProvider` (built via `createApolloClient` from [src/apollo-client.ts](src/apollo-client.ts)) and `UserServiceProvider`, passing `activeProfile` endpoint URLs as config.

### Shared Variable Keys

Scenarios share data (e.g., access tokens) through `setVariable`/`getVariable` using string keys defined in [src/common/types/well-known-variable-keys.ts](src/common/types/well-known-variable-keys.ts).

### GraphQL / Apollo

[src/apollo-client.ts](src/apollo-client.ts) creates an Apollo Client supporting both HTTP and WebSocket (subscriptions) via a split link. Cache is configured with `addTypename: false`.

### Styling

- **Semantic UI React** — pre-built UI components (buttons, forms, labels, etc.)
- **Tailwind CSS** — utility classes for layout/spacing

## Key Conventions

- **Functional components only** — no class components.
- Environment config lives in `.env` (copy from `.env.template`). Loaded via `env-cmd`.
- TypeScript is type-checked by `ForkTsCheckerWebpackPlugin`; Babel handles transpilation (so `tsc` alone won't emit output).
- Test files: `*.test.ts(x)` or `*.spec.ts(x)` under `src/`.
