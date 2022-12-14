import {
  GetSingleItem,
  ListCatalogItems,
} from './scenarios/catalog-consumption';
import {
  RenewUserTokenContainer,
  ResetPasswordWithAxAuthContainer,
  ShowUserInfoContainer,
  SignInWithAxAuthContainer,
  SignInWithExternalIdpsContainer,
  SignOutUserContainer,
  SignUpWithAxAuthContainer,
} from './scenarios/user-authentication';
import {
  CreateProfileContainer,
  DeleteProfileContainer,
  SwitchActiveProfileContainer,
  UpdateProfileContainer,
} from './scenarios/user-profile-management';
import {
  GetEntitlementMessage,
  PlayProtectedVideo,
  PlayUnprotectedVideo,
} from './scenarios/video-playback';

export const scenarios = [
  /**
   * User Authentication related scenarios
   */
  {
    groupName: 'User Authentication',
    shortId: 'show-user-info',
    displayName: 'Show User Info',
    displayOrder: 1,
    rootComponent: ShowUserInfoContainer,
  },
  {
    groupName: 'User Authentication',
    shortId: 'renew-access-token',
    displayName: 'Renew Access Token',
    displayOrder: 2,
    rootComponent: RenewUserTokenContainer,
  },
  {
    groupName: 'User Authentication',
    shortId: 'sign-up-with-axauth',
    displayName: 'Sign-Up With Email/Password',
    displayOrder: 3,
    rootComponent: SignUpWithAxAuthContainer,
  },
  {
    groupName: 'User Authentication',
    shortId: 'sign-in-with-axauth',
    displayName: 'Sign-In with Email/Password',
    displayOrder: 4,
    rootComponent: SignInWithAxAuthContainer,
  },
  {
    groupName: 'User Authentication',
    shortId: 'reset-password-with-axauth',
    displayName: 'Reset Password',
    displayOrder: 5,
    rootComponent: ResetPasswordWithAxAuthContainer,
  },
  {
    groupName: 'User Authentication',
    shortId: 'sign-in-with-external-idps',
    displayName: 'Sign-In With External Identity Providers',
    displayOrder: 6,
    rootComponent: SignInWithExternalIdpsContainer,
  },
  {
    groupName: 'User Authentication',
    shortId: 'sign-out-user',
    displayName: 'Sign-Out User',
    displayOrder: 7,
    rootComponent: SignOutUserContainer,
  },

  /**
   * User Profile Management related scenarios
   */
  {
    groupName: 'User Profile Management',
    shortId: 'switch-active-profile',
    displayName: 'Switch Active Profile',
    displayOrder: 1,
    rootComponent: SwitchActiveProfileContainer,
  },
  {
    groupName: 'User Profile Management',
    shortId: 'create-profile',
    displayName: 'Create Profile',
    displayOrder: 2,
    rootComponent: CreateProfileContainer,
  },
  {
    groupName: 'User Profile Management',
    shortId: 'update-profile',
    displayName: 'Update Profile',
    displayOrder: 3,
    rootComponent: UpdateProfileContainer,
  },
  {
    groupName: 'User Profile Management',
    shortId: 'delete-profile',
    displayName: 'Delete Profile',
    displayOrder: 4,
    rootComponent: DeleteProfileContainer,
  },

  /**
   * Catalog Consumption related scenarios
   */
  {
    groupName: 'Catalog Consumption',
    shortId: 'list-catalog-items',
    displayName: 'List Catalog Items',
    displayOrder: 1,
    rootComponent: ListCatalogItems,
  },
  {
    groupName: 'Catalog Consumption',
    shortId: 'get-single-item',
    displayName: 'Get Single Item',
    displayOrder: 2,
    rootComponent: GetSingleItem,
  },

  /**
   * Video Playback related scenarios
   */
  {
    groupName: 'Video Playback',
    shortId: 'get-entitlement-message',
    displayName: 'Get Entitlement Message',
    displayOrder: 1,
    rootComponent: GetEntitlementMessage,
  },
  {
    groupName: 'Video Playback',
    shortId: 'play-unprotected-video',
    displayName: 'Play Unprotected Video',
    displayOrder: 2,
    rootComponent: PlayUnprotectedVideo,
  },
  {
    groupName: 'Video Playback',
    shortId: 'play-protected-video',
    displayName: 'Play Protected Video',
    displayOrder: 3,
    rootComponent: PlayProtectedVideo,
  },
] as const;

export type ScenarioKey = typeof scenarios[number]['shortId'];
