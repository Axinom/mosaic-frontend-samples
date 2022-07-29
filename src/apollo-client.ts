import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

/**
 * Retrieves an ApolloClient by passing in the target GraphQL URL.
 *
 * Optionally a GraphQL Subscription WebSocket URL may be passed to create the ApolloClient with support for GraphQL Subscriptions.
 *
 * @param targetEndpoint The target GraphQL URL
 * @param subscriptionEndpoint The optional target GraphQL Subscription WebSocket URL
 * @returns
 */
export const getApolloClient = (
  targetEndpoint: string,
  subscriptionEndpoint?: string,
): ApolloClient<unknown> => {
  const httpLink = createHttpLink({
    uri: targetEndpoint,
  });

  let wsLink: WebSocketLink | undefined;
  let splitLink: ApolloLink | undefined;

  if (subscriptionEndpoint !== undefined) {
    wsLink = new WebSocketLink({
      uri: subscriptionEndpoint,
      options: {
        reconnect: true,
      },
    });

    /**
     * Split link to switch between `httpLink` and `wsLink` depending on the type of the operation being invoked.
     *
     * The split function takes three parameters:
     *  - A function that determines if the GQL operation is a subscription or not.
     *  - The Link to use if the GQL operation is a subscription.
     *  - The Link to use if the GQL operation is not a subscription.
     */
    splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);

        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    );
  }

  return new ApolloClient({
    link: subscriptionEndpoint ? splitLink : httpLink,
    cache: new InMemoryCache({ addTypename: false }),
  });
};
