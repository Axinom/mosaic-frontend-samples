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
  Form,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';

export const SignOutUserContainer: React.FC = () => {
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
        <Header size="huge">Sign-Out User</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to Sign-Out a user who has already
            Signed In. You can click the <b>[Get Access Token]</b> button to
            attempt to check if the user has already Signed In. If so, it will
            fetch a new access-token from the User Service.
          </p>
          <p>
            Then you can click the <b>[Sign-Out]</b> button to remove the
            refresh-token associated with this Signed In user. After this is
            done, it shall not be possible to use the <b>[Get Access Token]</b>{' '}
            button anymore to generate new access-tokens.
          </p>
          <p>
            To retry the scenario again, you can use one of the Sign-In
            scenarios.
          </p>
        </Container>

        <Divider />

        <UserServiceProvider
          userAuthConfig={userAuthConfig}
          userServiceConfig={userServiceConfig}
        >
          <SignOutUser></SignOutUser>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const SignOutUser: React.FC = () => {
  const { logger } = useScenarioHost();
  const { getToken, logoutUser } = useUserService();

  const signOut = async (): Promise<void> => {
    const logOutResponse = await logoutUser();

    if (logOutResponse === true) {
      logger.log(`calling [signOut]`, 'output: Successfully executed');
    } else {
      logger.error(
        `calling [signOut]`,
        'output: An error occurred while signing-out. Check user-service availability and try again.',
      );
    }
  };

  const getAccessToken = async (): Promise<void> => {
    const tokenResponse = await getToken();

    if (tokenResponse.code === 'SUCCESS') {
      delete tokenResponse.userProfile;
      delete tokenResponse.nextTokenRenewalAt;

      logger.log(`calling [getAccessToken]`, 'output:', tokenResponse);
    } else {
      logger.error(`calling [getAccessToken]`, 'output:', tokenResponse);
    }
  };

  return (
    <Form>
      <Button primary onClick={getAccessToken}>
        Get Access Token
      </Button>

      <Divider />

      <Button primary onClick={signOut}>
        Sign-Out
      </Button>
    </Form>
  );
};
