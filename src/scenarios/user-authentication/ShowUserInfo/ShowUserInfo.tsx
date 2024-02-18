import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import {
  TokenResponse,
  UserAuthConfig,
  UserServiceConfig,
  UserServiceProvider,
  useUserService,
} from '@axinom/mosaic-user-auth';
import { useEffect, useState } from 'react';
import {
  Card,
  Container,
  Divider,
  Header,
  Icon,
  Image,
  Label,
  Segment,
} from 'semantic-ui-react';

export const ShowUserInfoContainer: React.FC = () => {
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
        <Header size="huge">Show User Info</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to retrieve and show the signed-in
            User&apos;s information.
          </p>

          <p>
            This scenario will attempt to retrieve the user-info when it is
            loaded by calling the [getToken] method. Access-Tokens are always
            issued to a combination of <b>User + UserProfile</b>. You can use
            other scenarios to change the Active User Profile and to Manage User
            Profiles.
          </p>

          <p>
            If no user has already signed in, the scenario will show a
            corresponding message. However in real-life applications, it would
            be more common to offer a Sign-In experience in such instances.
            Please see other scenarios showcasing the Sign-In behavior.
          </p>
        </Container>

        <Divider />

        <UserServiceProvider
          userAuthConfig={userAuthConfig}
          userServiceConfig={userServiceConfig}
        >
          <ShowUserInfo></ShowUserInfo>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const ShowUserInfo: React.FC = () => {
  const { logger } = useScenarioHost();
  const { getToken } = useUserService();

  const [tokenResponse, setTokenResponse] = useState<
    TokenResponse | undefined
  >();

  useEffect(() => {
    (async () => {
      const tokenResponse = await getToken();

      setTokenResponse(tokenResponse);
      logger.log(`calling [getToken]`, 'output:', tokenResponse);
    })();
  }, [getToken, logger]);

  return tokenResponse === undefined ? (
    <Header size="small">Checking Signed-In Status ...</Header>
  ) : (
    <>
      <Header size="small">Signed-In User Info</Header>
      {tokenResponse.code === 'SUCCESS' ? (
        <Card style={{}} raised={true}>
          <Image
            src={
              // if the profile does not have a picture set, we use a sample avatar here for demonstration purposes
              tokenResponse.userProfile?.profilePictureUrl ??
              `https://api.dicebear.com/7.x/bottts/svg?seed=${tokenResponse.userToken?.userId}-${tokenResponse.userProfile?.displayName}`
            }
          />
          <Card.Content>
            <p>Email: {tokenResponse.userToken?.email}</p>
            <p>Name: {tokenResponse.userToken?.name}</p>
          </Card.Content>
          <Card.Content extra>
            <p>Profile Name: {tokenResponse.userProfile?.displayName}</p>
          </Card.Content>
        </Card>
      ) : (
        <Card style={{ maxWidth: '200px', textAlign: 'center' }} raised={true}>
          <Icon name="ban" size="massive" fitted />
          <Card.Content>No User Signed-In</Card.Content>
          <Card.Content extra></Card.Content>
        </Card>
      )}
    </>
  );
};
