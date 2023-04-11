import gql from 'graphql-tag';

export const getProgressQuery = gql`
  query GetProgress($getProgressInput: GetProgressInput!) {
    getProgress(input: $getProgressInput) {
      data {
        key
        value
      }
    }
  }
`;
