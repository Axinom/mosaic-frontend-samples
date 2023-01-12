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
  FormProps,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import MissingUserProfilePicture from '../../../common/assets/MissingUserProfilePicture.svg';

export const DeleteProfileContainer: React.FC = () => {
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
        <Header size="huge">Delete Profile</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to delete an existing user profile.
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
          <DeleteProfile></DeleteProfile>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const DeleteProfile: React.FC = () => {
  const { logger } = useScenarioHost();

  const { getToken, getUserProfiles, deleteUserProfile } = useUserService();
  const [endUserAccessToken, setEndUserAccessToken] = useState<string>('');

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);

  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

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
  }, [endUserAccessToken, getToken, getUserProfiles, logger]);

  useEffect(() => {
    (async () => {
      if (endUserAccessToken !== '') {
        const userProfilesResponse = await getUserProfiles(endUserAccessToken);
        logger.log(
          `calling [getUserProfiles]`,
          'output:',
          userProfilesResponse,
        );

        if (userProfilesResponse.code === 'SUCCESS') {
          setUserProfiles(userProfilesResponse.userProfiles ?? []);
        }
      }
    })();
  }, [endUserAccessToken, getUserProfiles, logger]);

  const deleteProfile = async (
    _event: React.FormEvent<HTMLFormElement>,
    _data: FormProps,
  ): Promise<void> => {
    const deleteUserProfileResponse = await deleteUserProfile(
      endUserAccessToken,
      selectedProfileId,
    );

    if (deleteUserProfileResponse.code === 'SUCCESS') {
      const updatedProfiles = [...userProfiles];
      const profileIndexToRemove = updatedProfiles.findIndex(
        (profile) => profile.id === selectedProfileId,
      );
      updatedProfiles.splice(profileIndexToRemove, 1);

      setUserProfiles(updatedProfiles);

      logger.log(
        `calling [${deleteProfile.name}]`,
        'output:',
        deleteUserProfileResponse,
      );
    } else {
      logger.error(
        `calling [${deleteProfile.name}]`,
        'output:',
        deleteUserProfileResponse,
      );
    }
  };

  return (
    <Form onSubmit={deleteProfile}>
      <Form.Group>
        <Form.Dropdown
          width={4}
          selection
          fluid
          label="User Profile"
          placeholder="Select a profile to delete"
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
        Delete Profile
      </Button>
    </Form>
  );
};
