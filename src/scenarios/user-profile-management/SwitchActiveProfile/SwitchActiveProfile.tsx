import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import {
  UserAuthConfig,
  UserProfile,
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
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import MissingUserProfilePicture from '../../../common/assets/MissingUserProfilePicture.svg';

export const SwitchActiveProfileContainer: React.FC = () => {
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
        <Header size="huge">Switch Active Profile</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to switch the active profile of the
            signed-in user. After changing the active profile, the User Service
            issued access-tokens will have the switched Profile ID embedded in
            the payload.
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
          <SwitchActiveProfile></SwitchActiveProfile>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const SwitchActiveProfile: React.FC = () => {
  const { logger } = useScenarioHost();

  const { getToken, getUserProfiles, setActiveProfile } = useUserService();
  const [endUserAccessToken, setEndUserAccessToken] = useState<string>('');

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  useEffect(() => {
    (async () => {
      const tokenResponse = await getToken();

      if (tokenResponse.code === 'SUCCESS') {
        setEndUserAccessToken(tokenResponse.userToken?.accessToken ?? '');

        // Fetch all the profiles for the currently signed-in user
        const userProfilesResponse = await getUserProfiles(
          tokenResponse.userToken?.accessToken ?? '',
        );
        setUserProfiles(userProfilesResponse.userProfiles ?? []);

        logger.log(
          `Current Active Profile (extracted from the user access-token)`,
          'output:',
          tokenResponse.userProfile ?? 'Undefined',
        );
      } else {
        logger.error(
          `calling [getToken]`,
          'output:',
          'Unable to retrieve an access-token. Please Sign-In first to use this scenario.',
        );
      }
    })();
  }, [getToken, getUserProfiles, logger]);

  const switchActiveProfile = async (
    _event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    // We switch the active profile now
    const setActiveProfileResponse = await setActiveProfile(
      endUserAccessToken,
      selectedProfileId,
    );

    logger.log(
      `calling [${switchActiveProfile.name}]`,
      'output:',
      setActiveProfileResponse,
    );

    if (setActiveProfileResponse.code === 'SUCCESS') {
      // After switching the active profile, we must ask for a new access-token from the user-service.
      // This token will contain the now active Profile ID embedded inside the token.
      const tokenResponse = await getToken();

      if (tokenResponse.code === 'SUCCESS') {
        setEndUserAccessToken(tokenResponse.userToken?.accessToken ?? '');

        logger.log(
          `Current Active Profile (extracted from the user access-token)`,
          'output:',
          tokenResponse.userProfile ?? 'Undefined',
        );
      } else {
        logger.error(`calling [getToken]`, 'output:', tokenResponse);
      }
    }
  };

  return (
    <Form onSubmit={switchActiveProfile}>
      <Form.Group>
        <Form.Dropdown
          width={4}
          selection
          fluid
          label="User Profile"
          placeholder="Select a profile to make active"
          options={userProfiles.map((profile) => {
            return {
              image: {
                avatar: true,
                src: profile.profilePictureUrl
                  ? profile.profilePictureUrl
                  : MissingUserProfilePicture,
              },
              text: profile.displayName,
              value: profile.id,
            };
          })}
          value={selectedProfileId}
          onChange={(event, { value }) => {
            setSelectedProfileId(value as string);
          }}
        ></Form.Dropdown>
      </Form.Group>

      <Button type="submit" primary disabled={selectedProfileId === ''}>
        Activate Profile
      </Button>
    </Form>
  );
};
