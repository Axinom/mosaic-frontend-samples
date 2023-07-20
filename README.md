# Mosaic Frontend Samples

This React application contains code examples that cover how to use Mosaic
services to achieve certain scenarios.

Each scenario is developed to be a concise example that showcases the use-case
(i.e. the scenario) and what code is responsible to achieve it. This will act as
developer documentation for frontend application developers who would be
interested to develop against Mosaic services.

## Project Structure

The scenarios are grouped into areas to be easily discoverable:

- user-authentication
  - SignInWithExternalIdp
  - ShowUserInfo
- user-profile-management
  - CreateProfile
  - SwitchActiveProfile
- catalog-consumption
  - GetSingleItem
- video-playback
  - PlayProtectedVideo
- etc.

The `scenario-registry.ts` found in the root of the project maintains an array
of all scenarios that will be loaded into the application, and this array is fed
into the `ScenarioHostApp` in the `index.tsx` file.

## ScenarioHost Features

The ScenarioHost exposes several commonly used features that maybe required by
each scenario.

Such as:

- activeProfile
  - Through this object, the individual scenario can access different Endpoint
    URLs of the Mosaic services, and different IDs (i.e. `tenant_id`,
    `environment_id`) that are configured by the user.
- logger
  - Through the logger each scenario can print some output to the Logger
    component that will provide meaningful feedback to the user.
- setVariable, getVariable
  - These methods will allow scenarios to share variables between different
    scenarios (i.e. user-access-token is set by scenario-A, and it is later
    accessed by scenario-B). The
    `./src/common/types/well-known-variable-keys.ts` file will list all
    well-known variables that can be shared between scenarios.

## Additional Notes

The `semantic-ui-react` library is used as the UI Component library when
developing the scenarios. In real-world applications, the appropriate UI
libraries shall be used.

# Running the Project

- Run `yarn` to install dependencies
- Copy `.env.template` into `.env`, and change the values if needed
- Run `yarn dev` to start running the project in watch mode
- Run `yarn util:start-proxy` to start a `localhost` proxy to the
  `Mosaic User Service` upstream
  - Ensure to set/update the URL for `User Auth Base URL` in your
    `Mosaic Frontend Samples` profile to use the proxy endpoint for requests

# Building for Production

- Run `yarn build` to generate the `build` folder
- Use the `Dockerfile` in the root to build a docker image
  - `docker build -t mosaic-fe-samples .`
