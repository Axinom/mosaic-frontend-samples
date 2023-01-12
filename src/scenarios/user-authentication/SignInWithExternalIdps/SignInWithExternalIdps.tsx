import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import {
  IdpConfiguration,
  UserAuthConfig,
  UserServiceConfig,
  UserServiceProvider,
  useUserService,
} from '@axinom/mosaic-user-auth';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import { VAR_KEY_AX_USER_ACCESS_TOKEN } from '../../../common/types/well-known-variable-keys';
import { ScenarioKey } from '../../../scenario-registry';

const SCENARIO_KEY_SIGN_IN_WITH_EXTERNAL_IDPS: ScenarioKey =
  'sign-in-with-external-idps';

export const SignInWithExternalIdpsContainer: React.FC = () => {
  const { activeProfile } = useScenarioHost();

  const userAuthConfig: UserAuthConfig = {
    userAuthBaseUrl: activeProfile.userAuthBaseURL,
    tenantId: activeProfile.tenantId,
    environmentId: activeProfile.environmentId,
    applicationId: activeProfile.applicationId,
  };

  const userServiceConfig: UserServiceConfig = {
    userServiceBaseUrl: activeProfile.userServiceBaseURL,
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">Sign-In With External Identity Providers</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to Sign-In with an external identity
            provider. The list of IDPs will be dynamically fetched based on the
            configured Application of the Profile.
          </p>

          <p>
            Once the Sign-In button for an IDP is clicked, the browser will
            navigate away into the corresponding Sign-In page of the IDP. Once
            the Sign-In experience is completed, the browser will redirect back
            to this scenario.
          </p>

          <p>
            When this scenario is loaded through this redirection, it will call
            the <b>[getToken]</b> method to fetch an access-token and log the
            result.
          </p>
        </Container>

        <Divider />

        <UserServiceProvider
          userAuthConfig={userAuthConfig}
          userServiceConfig={userServiceConfig}
        >
          <SignInWithExternalIdps></SignInWithExternalIdps>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const SignInWithExternalIdps: React.FC = () => {
  const { getIdpConfigurations, getAuthUrl, getToken } = useUserService();
  const { logger, setVariable } = useScenarioHost();
  const [idpConfigurations, setIDPConfigurations] = useState<
    IdpConfiguration[]
  >([]);

  useEffect(() => {
    (async () => {
      const idpConfigs = await getIdpConfigurations();
      setIDPConfigurations(idpConfigs);
      logger.log('calling [getIdpConfigurations]', 'output:', idpConfigs);

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('signInCompleted') === 'true') {
        logger.log('Redirection from IDP Detected');

        const tokenResponse = await getToken();
        setVariable(
          VAR_KEY_AX_USER_ACCESS_TOKEN,
          tokenResponse.userToken?.accessToken,
          `set via scenario: ${SCENARIO_KEY_SIGN_IN_WITH_EXTERNAL_IDPS}`,
        );
        logger.log('calling [getToken]', 'output:', tokenResponse);
      }
    })();
  }, [getIdpConfigurations, getToken, logger, setVariable]);

  return idpConfigurations.length === 0 ? (
    <Header size="small">No IDPs Configured for the Application</Header>
  ) : (
    <>
      <Header size="small">Select an IDP to Sign-In</Header>
      <Grid>
        {idpConfigurations
          .sort(
            (a, b) =>
              (a.sortOrder ?? Number.MAX_VALUE) -
              (b.sortOrder ?? Number.MAX_VALUE),
          )
          .map((idpConfig) => {
            return (
              <React.Fragment key={idpConfig.idpConnectionId}>
                <Grid.Row style={{ paddingBottom: 0 }}>
                  <Grid.Column mobile={16} tablet={8} computer={4}>
                    <Button
                      fluid
                      color={
                        idpConfig.providerId === 'AX_GOOGLE'
                          ? 'google plus'
                          : idpConfig.providerId === 'AX_APPLE'
                          ? 'grey'
                          : idpConfig.providerId === 'AX_FACEBOOK'
                          ? 'facebook'
                          : idpConfig.providerId === 'MICROSOFT'
                          ? 'blue'
                          : idpConfig.providerId === 'GITHUB'
                          ? 'green'
                          : 'teal'
                      }
                      onClick={() => {
                        const authUrl = getAuthUrl(
                          idpConfig.idpConnectionId,
                          `${window.location.origin}/${SCENARIO_KEY_SIGN_IN_WITH_EXTERNAL_IDPS}?signInCompleted=true`,
                        );
                        window.location.assign(authUrl);
                      }}
                    >
                      Sign-In with {idpConfig.title}
                    </Button>
                  </Grid.Column>
                </Grid.Row>
              </React.Fragment>
            );
          })}
      </Grid>
    </>
  );
};
