import gql from 'graphql-tag';

export const getAllSubscriptionsQuery = gql`
  query GetSubscriptions {
    subscriptions(orderBy: LIFECYCLE_STATUS_ASC) {
      nodes {
        id
        lifecycleStatus
        subscriptionPlan {
          title
        }
        paymentPlan {
          title
        }
      }
    }
  }
`;

export const CancelSubscriptionMutation = gql`
  mutation CancelSubscription($input: PaypalCancelSubscriptionInput!) {
    paypalCancelSubscription(input: $input) {
      subscription {
        lifecycleStatus
      }
    }
  }
`;
