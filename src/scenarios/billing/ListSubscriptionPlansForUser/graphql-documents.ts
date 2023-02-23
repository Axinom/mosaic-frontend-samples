import gql from 'graphql-tag';

export const getActiveSubscriptionQuery = gql`
  query GetActiveSubscription($subscriptionFilter: SubscriptionTypeFilter) {
    subscriptions(
      filter: $subscriptionFilter
      condition: { lifecycleStatus: ACTIVE }
      first: 1
    ) {
      nodes {
        id
        country
        activationDate
        lifecycleStatus
        subscriptionPlan {
          id
          title
        }
        paymentProvider {
          title
        }
        paymentPlan {
          title
          prices(first: 1) {
            nodes {
              price
              currency
            }
          }
        }
      }
    }
  }
`;

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
        coverImagePath
        paymentPlans(condition: { isActive: true }) {
          nodes {
            title
            description
            periodUnit
            periodQuantity
            providerConfigs {
              nodes {
                paymentProvider {
                  title
                }
              }
            }
            prices(filter: $paymentPlanPriceFilter) {
              nodes {
                price
                currency
              }
            }
          }
        }
      }
    }
  }
`;
