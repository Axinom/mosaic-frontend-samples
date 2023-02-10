import { loadScript } from '@paypal/paypal-js';
import { ApolloClient } from '@apollo/client';
import {
  subscribePopupMutation,
  activateSubscriptionMutation,
} from './graphql-documents';
import { Logger } from '@axinom/mosaic-fe-samples-host';

export const setupPaypal = async (
  paypalConfig: {
    clientId: string;
    buttonContainerId: string;
  },
  billingServiceConfig: {
    paymentPlanId: string;
    countryCode: string;
    userAccessToken: string;
  },
  logger: Logger,
  apolloClient: ApolloClient<unknown>,
): Promise<void> => {
  const paypal = await loadScript({
    'client-id': paypalConfig.clientId,
    vault: 'true',
    intent: 'subscription',
    'data-sdk-integration-source': 'button-factory',
  });

  if (paypal && paypal.Buttons) {
    await paypal
      .Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe',
        },
        createSubscription: async (data, actions) => {
          try {
            const result = await apolloClient.query({
              query: subscribePopupMutation,
              variables: {
                input: {
                  paymentPlanId: billingServiceConfig.paymentPlanId,
                  purchaseFlow: 'POPUP',
                  country: billingServiceConfig.countryCode,
                },
              },
              context: {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${billingServiceConfig.userAccessToken}`,
                },
              },
              fetchPolicy: 'no-cache',
            });

            logger.log(
              'method [createSubscription]',
              'paypal output:',
              data,
              'billing service output:',
              result.data,
            );

            if (result.errors) {
              logger.error(result.errors);
            } else {
              return actions.subscription.create({
                plan_id: result.data.paypalSubscribe.paypalPlanId,
                custom_id: result.data.paypalSubscribe.customId,
              });
            }
          } catch (error) {
            if (error instanceof Error) {
              logger.error(
                'method [createSubscription]',
                'output:',
                error.message,
              );
            }
          }
          return '';
        },
        onApprove: async (data, _actions) => {
          try {
            const result = await apolloClient.query({
              query: activateSubscriptionMutation,
              variables: {
                input: {
                  paypalSubscriptionId: data.subscriptionID,
                },
              },
              context: {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${billingServiceConfig.userAccessToken}`,
                },
              },
              fetchPolicy: 'no-cache',
            });

            logger.log(
              'method [onApprove]',
              'paypal output:',
              data,
              'billing service output:',
              result.data,
            );

            if (result.errors) {
              logger.error(result.errors);
            } else {
              const subscriptionStatus =
                result.data.paypalActivateSubscription.subscription
                  .lifecycleStatus;
              if (subscriptionStatus === 'ACTIVE') {
                logger.log(
                  `Subscription with ID ${result.data.paypalActivateSubscription.subscription.id} should be active now. You can verify it by using the 'List Subscription Plans' scenario.`,
                );
              } else {
                logger.log(
                  `Subscription with ID ${result.data.paypalActivateSubscription.subscription.id} is now in ${subscriptionStatus} state.`,
                );
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              logger.error('method [onApprove]', 'output:', error.message);
            }
          }
        },
        onCancel: async () => {
          logger.log('The subscription is cancelled by the user.');
        },
        onError: async () => {
          logger.log('An error occurred in the subscription.');
        },
      })
      .render(`#${paypalConfig.buttonContainerId}`);
  }
};
