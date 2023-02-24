import gql from 'graphql-tag';

export const getSubscriptionTransactionsQuery = gql`
  query GetSubscriptionTransactions {
    subscriptionTransactions {
      nodes {
        currency
        description
        paymentProviderReference
        paymentProvider {
          title
        }
        periodEndDate
        totalPrice
        transactionDate
        transactionType
      }
    }
  }
`;
