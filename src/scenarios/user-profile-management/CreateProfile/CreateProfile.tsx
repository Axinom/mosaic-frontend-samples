import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import {
  UserAuthConfig,
  UserServiceConfig,
  UserServiceProvider,
  useUserService,
} from '@axinom/mosaic-user-auth';
import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Divider,
  Form,
  FormProps,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';

export const CreateProfileContainer: React.FC = () => {
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
        <Header size="huge">Create Profile</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>This scenario demonstrates how to create a new user profile.</p>

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
          <CreateProfile></CreateProfile>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const CreateProfile: React.FC = () => {
  const { logger } = useScenarioHost();

  const { getToken, createUserProfile } = useUserService();
  const [endUserAccessToken, setEndUserAccessToken] = useState<string>('');

  const [displayName, setDisplayName] = useState<string>('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  useEffect(() => {
    (async () => {
      const tokenResponse = await getToken();

      if (tokenResponse.code === 'SUCCESS') {
        setEndUserAccessToken(tokenResponse.userToken?.accessToken ?? '');
      } else {
        logger.error(
          `calling [getToken]`,
          'output:',
          'Unable to retrieve an access-token. Please Sign-In first to use this scenario.',
        );
      }
    })();
  }, [getToken, logger]);

  const createProfile = async (
    _event: React.FormEvent<HTMLFormElement>,
    _data: FormProps,
  ): Promise<void> => {
    // Validate the profile-picture-URL
    if (profilePictureUrl !== '') {
      try {
        new URL(profilePictureUrl);
      } catch {
        logger.warn(
          `calling [${createProfile.name}]`,
          `output: Incorrect URL format for Profile Picture URL. Please try again`,
        );

        return;
      }
    }

    const createProfileResponse = await createUserProfile(
      endUserAccessToken,
      displayName,
      profilePictureUrl,
    );

    if (createProfileResponse.code === 'SUCCESS') {
      logger.log(
        `calling [${createProfile.name}]`,
        'output:',
        createProfileResponse,
      );
    } else {
      logger.error(
        `calling [${createProfile.name}]`,
        'output:',
        createProfileResponse,
      );
    }
  };

  return (
    <Form onSubmit={createProfile}>
      <Form.Input
        width={4}
        icon="id card outline"
        iconPosition="left"
        type="text"
        placeholder="Display Name"
        label="Display Name"
        value={displayName}
        required
        onChange={(event) => {
          setDisplayName(event.target.value);
        }}
      />

      <Form.Input
        width={4}
        icon="image outline"
        iconPosition="left"
        type="text"
        placeholder="Profile Picture URL"
        label="Profile Picture URL"
        value={profilePictureUrl}
        onChange={(event) => {
          setProfilePictureUrl(event.target.value);
        }}
      />

      <Button type="submit" primary>
        Create New Profile
      </Button>
    </Form>
  );
};
