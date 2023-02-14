import gql from 'graphql-tag';

export const getAllSubscriptionsQuery = gql`
  query GetSubscriptions {
    subscriptions(orderBy: LIFECYCLE_STATUS_ASC) {
      nodes {
        id
        country
        activationDate
        lifecycleStatus
        subscriptionPlan {
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
