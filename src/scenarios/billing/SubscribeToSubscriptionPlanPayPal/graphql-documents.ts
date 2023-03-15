import gql from 'graphql-tag';

export const getPaymentPlansQuery = gql`
  query GetPaymentPlans {
    paymentPlans(
      filter: {
        providerConfigs: { some: { paymentProviderKey: { equalTo: "PAYPAL" } } }
      }
    ) {
      nodes {
        id
        subscriptionPlan {
          title
        }
        title
        periodQuantity
        periodUnit
      }
    }
    paypalSettings(filter: { paymentProviderKey: { equalTo: "PAYPAL" } }) {
      nodes {
        clientId
        isSandbox
      }
    }
  }
`;

export const getPaymentPlanPricesQuery = gql`
  query GetPaymentPlanPrices($id: UUID!) {
    paymentPlan(id: $id) {
      prices {
        nodes {
          country
          currency
          price
        }
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
