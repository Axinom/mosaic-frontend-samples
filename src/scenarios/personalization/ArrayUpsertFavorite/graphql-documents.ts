import gql from 'graphql-tag';

export const upsertArrayItemMutation = gql`
  mutation UpsertArrayItem($input: UpsertArrayItemInput!) {
    upsertArrayItem(input: $input) {
      acknowledged
      insertedCount
      matchedCount
      modifiedCount
      deletedCount
      item {
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
