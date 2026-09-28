import { ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';

/**
 * Catalog entities are only used as realistic sample data for the favorites array.
 * The catalog entity ID doubles as the customer-owned `itemId` of the favorite.
 */
export interface CatalogEntity {
  id: string;
  title: string;
  type: 'Movie' | 'TV Show';
}

const getCatalogItemsQuery = gql`
  query GetCatalogItems {
    movies {
      nodes {
        id
        title
      }
    }
    tvshows {
      nodes {
        id
        title
      }
    }
  }
`;

interface CatalogNode {
  id: string;
  title: string;
}

export const fetchCatalogEntities = async (
  catalogClient: ApolloClient<unknown>,
  userAccessToken: string | undefined,
): Promise<CatalogEntity[]> => {
  const result = await catalogClient.query<{
    movies: { nodes: CatalogNode[] };
    tvshows: { nodes: CatalogNode[] };
  }>({
    query: getCatalogItemsQuery,
    context: {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    },
    fetchPolicy: 'no-cache',
  });

  return [
    ...result.data.movies.nodes.map(
      (movie): CatalogEntity => ({ ...movie, type: 'Movie' }),
    ),
    ...result.data.tvshows.nodes.map(
      (tvShow): CatalogEntity => ({ ...tvShow, type: 'TV Show' }),
    ),
  ];
};
