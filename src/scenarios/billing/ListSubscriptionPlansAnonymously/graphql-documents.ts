import gql from 'graphql-tag';

export const getSubscriptionPlansQuery = gql`
  query GetSubscriptionPlans(
    $filter1: SubscriptionPlanFilter
    $filter2: PaymentPlanPriceFilter
  ) {
    subscriptionPlans(filter: $filter1) {
      totalCount
      nodes {
        title
        description
        isActive
        coverImagePath
        paymentPlans {
          nodes {
            title
            description
            periodUnit
            periodQuantity
            isActive
            providerConfigs {
              nodes {
                paymentProvider {
                  title
                }
              }
            }
            prices(filter: $filter2) {
              nodes {
                country
                currency
                price
              }
            }
          }
        }
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

export const authenticateEndUserApplication = gql`
  mutation AuthenticateEndUserApplication(
    $input: AuthenticateEndUserApplicationInput!
  ) {
    authenticateEndUserApplication(input: $input) {
      accessToken
      expiresInSeconds
      tokenType
    }
  }
`;