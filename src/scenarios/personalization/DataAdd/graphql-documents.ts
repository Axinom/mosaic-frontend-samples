import gql from 'graphql-tag';

export const setKeyMutation = gql`
  mutation SetKey($input: SetKeyInput!) {
    setKey(input: $input) {
      acknowledged
      insertedCount
      updatedCount
    }
  }
`;
