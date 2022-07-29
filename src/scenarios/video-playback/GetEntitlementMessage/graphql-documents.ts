import gql from 'graphql-tag';

export const getEntitlementMessageQuery = gql`
  query GetEntitlementMessage($input: EntitlementInput!) {
    entitlement(input: $input) {
      entitlementMessageJwt
      claims
    }
  }
`;
