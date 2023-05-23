import gql from 'graphql-tag';

export const getPaypalSettingsQuery = gql`
  query GetPaypalSettings {
    paypalSettings {
      nodes {
        clientId
        isSandbox
      }
    }
  }
`;

export const subscribeRedirectMutation = gql`
  mutation SubscribeRedirect($input: PaypalSubscribeInput!) {
    paypalSubscribe(input: $input) {
      approveUrl
    }
  }
`;

export const subscribePopupMutation = gql`
  mutation SubscribePopup($input: PaypalSubscribeInput!) {
    paypalSubscribe(input: $input) {
      paypalPlanId
      customId
    }
  }
`;

export const activateSubscriptionMutation = gql`
  mutation ActivateSubscription($input: PaypalActivateSubscriptionInput!) {
    paypalActivateSubscription(input: $input) {
      subscription {
        id
        lifecycleStatus
      }
    }
  }
`;
