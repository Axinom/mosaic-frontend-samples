import { ApolloError } from '@apollo/client';
import type { JSONValue, Logger } from '@axinom/mosaic-fe-samples-host';

interface GraphQLErrorDetails {
  message: string;
  extensions?: Record<string, unknown>;
}

/**
 * Logs a failed GraphQL call including the `extensions` of every returned error.
 *
 * The Personalization Service reports machine-readable failure details in `errors[].extensions`
 * (e.g. `reason: 'CURSOR_CONSTRAINT'`, `field: 'after'`, `constraint: 'queryMismatch'`).
 * Clients should branch on those values and never parse the human-readable `message`.
 */
export const logGraphQLError = (
  logger: Logger,
  method: string,
  error: unknown,
): void => {
  logger.error(`method [${method}]`, 'output:', getErrorDetails(error));
};

const getErrorDetails = (error: unknown): JSONValue => {
  if (!(error instanceof ApolloError)) {
    return error instanceof Error ? error.message : JSON.stringify(error);
  }

  // GraphQL errors are either part of a successful HTTP response (`graphQLErrors`)
  // or part of the body of a non-2xx HTTP response (`networkError.result.errors`).
  const networkError = error.networkError;
  const networkResultErrors: GraphQLErrorDetails[] =
    networkError !== null &&
    'result' in networkError &&
    Array.isArray(networkError.result?.errors)
      ? networkError.result.errors
      : [];

  const errors = [...error.graphQLErrors, ...networkResultErrors].map(
    ({ message, extensions }): GraphQLErrorDetails => ({ message, extensions }),
  );

  return errors.length > 0 ? errors : error.message;
};
