import gql from 'graphql-tag';

export const replaceArrayItemsMutation = gql`
  mutation ReplaceArrayItems($input: ReplaceArrayItemsInput!) {
    replaceArrayItems(input: $input) {
      acknowledged
      items {
        key
        value
        id
        itemId
        sortString
        sortNumber
        sortDate
        dateModified
      }
    }
  }
`;
