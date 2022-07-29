import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import {
  UserAuthConfig,
  UserServiceConfig,
  UserServiceProvider,
  useUserService,
} from '@axinom/mosaic-user-auth';
import {
  Button,
  Container,
  Divider,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import { VAR_KEY_AX_USER_ACCESS_TOKEN } from '../../../common/types/well-known-variable-keys';
import { ScenarioKey } from '../../../scenario-registry';

const SCENARIO_KEY_RENEW_ACCESS_TOKEN: ScenarioKey = 'renew-access-token';

export const RenewUserTokenContainer: React.FC = () => {
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
        <Header size="huge">Renew Access Token</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
          <Label>ax-auth-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to renew the access-token of an
            already signed-in User.
          </p>

          <p>
            If the user is not already signed-in, you can use one of the Sign-In
            scenarios.
          </p>
        </Container>

        <Divider />

        <UserServiceProvider
          userAuthConfig={userAuthConfig}
          userServiceConfig={userServiceConfig}
        >
          <RenewUserToken></RenewUserToken>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const RenewUserToken: React.FC = () => {
  const { logger, getVariable, setVariable } = useScenarioHost();
  const { getToken } = useUserService();
  const handleRenewAccessTokenClick = async (): Promise<void> => {
    const tokenResponse = await getToken();

    if (tokenResponse.code === 'SUCCESS') {
      setVariable(
        VAR_KEY_AX_USER_ACCESS_TOKEN,
        tokenResponse.userToken?.accessToken,
        `set via scenario: ${SCENARIO_KEY_RENEW_ACCESS_TOKEN}`,
      );
      logger.log(
        'calling [getToken]',
        'output: ',
        tokenResponse.userToken?.accessToken ?? '',
      );
    } else {
      logger.error('calling [getToken]', 'output:', tokenResponse);
    }
  };

  return (
    <>
      <Button
        primary
        onClick={() => {
          logger.log(
            'calling [getVariable]',
            'output:',
            getVariable(VAR_KEY_AX_USER_ACCESS_TOKEN) ?? 'No value was set',
          );
        }}
      >
        Log Current Access Token
      </Button>

      <Divider />

      <Button primary onClick={handleRenewAccessTokenClick}>
        Renew Access Token
      </Button>
    </>
  );
};
