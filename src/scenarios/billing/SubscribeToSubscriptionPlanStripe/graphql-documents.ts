import gql from 'graphql-tag';

export const getPaymentPlansQuery = gql`
  query GetPaymentPlans {
    paymentPlans(
      filter: {
        providerConfigs: {
          some: { paymentProviderKey: { equalTo: "CPC_STRIPE" } }
        }
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
