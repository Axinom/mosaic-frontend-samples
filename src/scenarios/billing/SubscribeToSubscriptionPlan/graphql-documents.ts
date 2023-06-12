import gql from 'graphql-tag';

export const getPaymentPlansQuery = gql`
  query GetPaymentPlans {
    paymentPlans(
      filter: {
        subscriptionPlan: { isActive: { equalTo: true } }
        isActive: { equalTo: true }
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

export const getPaymentPlanDetailsQuery = gql`
  query GetPaymentPlanDetails($id: UUID!) {
    paymentPlan(id: $id) {
      prices {
        nodes {
          country
          currency
          price
        }
      }
      providerConfigs {
        nodes {
          paymentProviderKey
        }
      }
    }
  }
`;
