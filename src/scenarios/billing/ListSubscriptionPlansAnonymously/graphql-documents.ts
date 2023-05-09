import gql from 'graphql-tag';

export const getSubscriptionPlansQuery = gql`
  query GetSubscriptionPlans(
    $subscriptionPlanFilter: SubscriptionPlanFilter
    $paymentPlanPriceFilter: PaymentPlanPriceFilter
  ) {
    subscriptionPlans(
      filter: $subscriptionPlanFilter
      condition: { isActive: true }
    ) {
      totalCount
      nodes {
        title
        description
        isActive
        coverImagePath
        paymentPlans(condition: { isActive: true }) {
          totalCount
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
            prices(filter: $paymentPlanPriceFilter) {
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
