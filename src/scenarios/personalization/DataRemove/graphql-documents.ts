import gql from 'graphql-tag';

export const deleteKeyMutation = gql`
  mutation DeleteKey($input: DeleteKeyInput!) {
    deleteKey(input: $input) {
      acknowledged
      deletedCount
    }
  }
`;
