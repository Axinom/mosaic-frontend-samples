import gql from 'graphql-tag';

export const listArrayItemsQuery = gql`
  query ListArrayItems($input: ListArrayItemsInput!) {
    listArrayItems(input: $input) {
      totalCount
      data {
        key
        value
        id
        itemId
        sortString
        sortNumber
        sortDate
        dateModified
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const deleteArrayItemsMutation = gql`
  mutation DeleteArrayItems($input: DeleteArrayItemsInput!) {
    deleteArrayItems(input: $input) {
      acknowledged
      deletedCount
    }
  }
`;
