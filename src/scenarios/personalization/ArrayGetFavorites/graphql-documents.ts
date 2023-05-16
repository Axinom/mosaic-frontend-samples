import gql from 'graphql-tag';

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
