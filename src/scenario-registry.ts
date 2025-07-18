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
import { ImagePreview } from './scenarios/image';
import {
  ArrayGetFavorites,
  ArrayAddFavorites,
  ArrayRemoveFavorites,
  ProgressGet,
  ProgressSet,
  DataAdd,
  DataGet,
  DataRemove,
} from './scenarios/personalization';

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

  /**
   * Image Preview related scenarios
   */
  {
    groupName: 'Image',
    shortId: 'image-preview',
    displayName: 'Image Preview',
    displayOrder: 1,
    rootComponent: ImagePreview,
  },

  /**
   * Personalization related scenarios
   */
  {
    groupName: 'Personalization',
    shortId: 'progress-get',
    displayName: 'Progress: Get',
    displayOrder: 1,
    rootComponent: ProgressGet,
  },
  {
    groupName: 'Personalization',
    shortId: 'progress-set',
    displayName: 'Progress: Set',
    displayOrder: 2,
    rootComponent: ProgressSet,
  },
  {
    groupName: 'Personalization',
    shortId: 'array-get-favorites',
    displayName: 'Array: Get Favorites',
    displayOrder: 3,
    rootComponent: ArrayGetFavorites,
  },
  {
    groupName: 'Personalization',
    shortId: 'array-add-favorites',
    displayName: 'Array: Add Favorite(s)',
    displayOrder: 4,
    rootComponent: ArrayAddFavorites,
  },
  {
    groupName: 'Personalization',
    shortId: 'array-remove-favorites',
    displayName: 'Array: Remove Favorite(s)',
    displayOrder: 5,
    rootComponent: ArrayRemoveFavorites,
  },
  {
    groupName: 'Personalization',
    shortId: 'data-get',
    displayName: 'Data: Get',
    displayOrder: 6,
    rootComponent: DataGet,
  },
  {
    groupName: 'Personalization',
    shortId: 'data-add',
    displayName: 'Data: Add',
    displayOrder: 7,
    rootComponent: DataAdd,
  },
  {
    groupName: 'Personalization',
    shortId: 'data-remove',
    displayName: 'Data: Remove',
    displayOrder: 8,
    rootComponent: DataRemove,
  },
] as const;

export type ScenarioKey = (typeof scenarios)[number]['shortId'];
