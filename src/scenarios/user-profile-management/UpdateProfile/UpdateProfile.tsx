import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import {
  UserAuthConfig,
  UserProfile,
  UserProfileUpdateInput,
  UserServiceConfig,
  UserServiceProvider,
  useUserService,
} from '@axinom/mosaic-user-auth';
import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Divider,
  DropdownProps,
  Form,
  FormProps,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import MissingUserProfilePicture from '../../../common/assets/MissingUserProfilePicture.svg';

export const UpdateProfileContainer: React.FC = () => {
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
        <Header size="huge">Update Profile</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to update an existing user profile.
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
          <EditProfile></EditProfile>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const EditProfile: React.FC = () => {
  const { logger } = useScenarioHost();

  const { getToken, getUserProfiles, updateUserProfile } = useUserService();
  const [endUserAccessToken, setEndUserAccessToken] = useState<string>('');

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  const [displayName, setDisplayName] = useState<string>('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  useEffect(() => {
    (async () => {
      const tokenResponse = await getToken();

      if (tokenResponse.code === 'SUCCESS') {
        setEndUserAccessToken(tokenResponse.userToken?.accessToken ?? '');

        const userProfilesResponse = await getUserProfiles(
          tokenResponse.userToken?.accessToken ?? '',
        );
        logger.log(
          `calling [getUserProfiles]`,
          'output:',
          userProfilesResponse,
        );

        if (userProfilesResponse.code === 'SUCCESS') {
          setUserProfiles(userProfilesResponse.userProfiles ?? []);
        }
      } else {
        logger.error(
          `calling [getToken]`,
          'output:',
          'Unable to retrieve an access-token. Please Sign-In first to use this scenario.',
        );
      }
    })();
  }, [getToken, getUserProfiles, logger]);

  const handleSelectedProfileChanged = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps,
  ): void => {
    const profileId = data.value as string;
    setSelectedProfileId(profileId);

    const selectedUserProfile = userProfiles.find(
      (profile) => profile.id === profileId,
    );
    setDisplayName(selectedUserProfile?.displayName ?? '');
    setProfilePictureUrl(selectedUserProfile?.profilePictureUrl ?? '');
  };

  const updateProfile = async (
    _event: React.FormEvent<HTMLFormElement>,
    _data: FormProps,
  ): Promise<void> => {
    // Validate the profile-picture-URL
    if (profilePictureUrl !== '') {
      try {
        new URL(profilePictureUrl);
      } catch {
        logger.warn(
          `calling [${updateProfile.name}]`,
          `output: Incorrect URL format for Profile Picture URL. Please try again`,
        );

        return;
      }
    }

    const userProfileToUpdate: UserProfileUpdateInput = {
      id: selectedProfileId,
      displayName: displayName,
      profilePictureUrl: profilePictureUrl,
    };

    const updateUserProfileResponse = await updateUserProfile(
      endUserAccessToken,
      userProfileToUpdate,
    );

    if (updateUserProfileResponse.code === 'SUCCESS') {
      const updatedProfiles = [...userProfiles];
      const updatedProfileIndex = updatedProfiles.findIndex(
        (profile) => profile.id === userProfileToUpdate.id,
      );
      updatedProfiles[updatedProfileIndex] =
        updateUserProfileResponse.updatedUserProfile ??
        updatedProfiles[updatedProfileIndex];

      setUserProfiles(updatedProfiles);

      logger.log(
        `calling [${updateProfile.name}]`,
        'output:',
        updateUserProfileResponse,
      );
    } else {
      logger.error(
        `calling [${updateProfile.name}]`,
        'output:',
        updateUserProfileResponse,
      );
    }
  };

  return (
    <Form onSubmit={updateProfile}>
      <Form.Group>
        <Form.Dropdown
          width={4}
          fluid
          selection
          label="User Profile"
          placeholder="Select a profile to update"
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
          onChange={handleSelectedProfileChanged}
        ></Form.Dropdown>
      </Form.Group>

      <Form.Group>
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
      </Form.Group>

      <Form.Group>
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
      </Form.Group>

      <Button type="submit" primary disabled={selectedProfileId === ''}>
        Update Profile
      </Button>
    </Form>
  );
};
