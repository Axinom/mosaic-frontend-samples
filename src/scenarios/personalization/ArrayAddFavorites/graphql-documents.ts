import gql from 'graphql-tag';

export const getCatalogItemsQuery = gql`
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

export const getArrayQuery = gql`
  query GetArray($input: GetArrayInput!) {
    getArray(input: $input) {
      key
      totalCount
      data {
        key
        value
        id
      }
    }
  }
`;

export const setArrayItemMutation = gql`
  mutation SetArrayItem($input: SetArrayItemInput!) {
    setArrayItem(input: $input) {
      acknowledged
      insertedCount
      modifiedCount
    }
  }
`;
