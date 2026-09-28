import gql from 'graphql-tag';

export const lookupArrayItemsQuery = gql`
  query LookupArrayItems($input: LookupArrayItemsInput!) {
    lookupArrayItems(input: $input) {
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
