/**
 * All Array API scenarios (recommended and deprecated) operate on the same array.
 * Favorites written by the deprecated scenarios store the catalog entity ID in `value.id`,
 * which makes them addressable by `itemId` in the recommended APIs without any data migration.
 */
export const FAVORITES_SCOPE = 'PROFILE';
export const FAVORITES_KEY = 'user_profile:favorites';
