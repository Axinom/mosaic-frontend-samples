import gql from 'graphql-tag';

export const getKeyQuery = gql`
  query GetKey($input: GetKeyInput!) {
    getKey(input: $input) {
      data {
        key
        value
      }
    }
  }
`;
