import gql from 'graphql-tag';

export const listArrayItemsQuery = gql`
  query ListArrayItems($input: ListArrayItemsInput!) {
    listArrayItems(input: $input) {
      totalCount
      sort
      sortDirection
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
