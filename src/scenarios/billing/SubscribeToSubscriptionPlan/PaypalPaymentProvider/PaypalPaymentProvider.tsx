import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import { useEffect, useState, useCallback } from 'react';
import { Button, Form } from 'semantic-ui-react';
import {
  getPaypalSettingsQuery,
  subscribeRedirectMutation,
} from './graphql-documents';
import { setupPaypal } from './paypal-utils';
import { ApolloClient } from '@apollo/client';

type PurchaseFlow = 'POPUP' | 'REDIRECT';

export interface PaypalPaymentProviderProps {
  userAccessToken: string;
  paymentPlanId: string;
  countryCode: string;
  apolloClient: ApolloClient<unknown>;
}

export const PaypalPaymentProvider: React.FC<PaypalPaymentProviderProps> = ({
  userAccessToken,
  paymentPlanId,
  countryCode,
  apolloClient,
}) => {
  const { logger } = useScenarioHost();
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [purchaseFlow, setPurchaseFlow] = useState<PurchaseFlow | null>(null);
  const [paypalInitializing, setPaypalInitializing] = useState<boolean>(false);

  const fetchPaypalSettings = useCallback(async (): Promise<void> => {
    try {
      const result = await apolloClient.query({
        query: getPaypalSettingsQuery,
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      logger.log(
        `method [${fetchPaypalSettings.name}]`,
        'output:',
        result.data,
      );

      if (result.errors) {
        logger.error(result.errors);
      } else {
        const paypalSettings = result.data.paypalSettings.nodes;
        if (Array.isArray(paypalSettings) && paypalSettings.length > 0) {
          setPaypalClientId(paypalSettings[0].clientId);
        } else {
          logger.error('Unable to fetch PayPal settings.');
        }
      }
    } catch (error) {
      setPaypalClientId(null);

      if (error instanceof Error) {
        logger.error(
          `method [${fetchPaypalSettings.name}]`,
          'output:',
          error.message,
        );
      }
    }
  }, [apolloClient, logger, userAccessToken]);

  // Fetch PayPal settings
  useEffect(() => {
    fetchPaypalSettings();
  }, [fetchPaypalSettings]);

  const changePurchaseFlow = async (
    newPurchaseFlow: PurchaseFlow,
  ): Promise<void> => {
    if (newPurchaseFlow === 'POPUP') {
      if (userAccessToken && paypalClientId && paymentPlanId && countryCode) {
        setPurchaseFlow(newPurchaseFlow);
        setPaypalInitializing(true);
        try {
          await setupPaypal(
            {
              clientId: paypalClientId,
              buttonContainerId: 'paypal-btn-container',
            },
            {
              paymentPlanId,
              countryCode,
              userAccessToken,
            },
            logger,
            apolloClient,
          );
        } catch (error) {
          if (error instanceof Error) {
            logger.error(
              `method [${changePurchaseFlow.name}]`,
              'output:',
              'failed to load the PayPal JS SDK script. ' + error.message,
            );
          }
        }
        setPaypalInitializing(false);
      }
    } else {
      setPurchaseFlow(newPurchaseFlow);
    }
  };

  const subscribeToPaymentPlan = async (): Promise<void> => {
    if (purchaseFlow === 'REDIRECT') {
      try {
        const result = await apolloClient.mutate({
          mutation: subscribeRedirectMutation,
          variables: {
            input: {
              paymentPlanId,
              purchaseFlow: 'REDIRECT',
              country: countryCode,
            },
          },
          context: {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userAccessToken}`,
            },
          },
          fetchPolicy: 'no-cache',
        });

        logger.log(
          `method [${subscribeToPaymentPlan.name}]`,
          'output:',
          result.data,
        );
        if (result.errors) {
          logger.error(result.errors);
        } else {
          window.location.href = result.data.paypalSubscribe.approveUrl;
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(
            `method [${subscribeToPaymentPlan.name}]`,
            'output:',
            error.message,
          );
        }
      }
    }
  };

  return (
    <>
      <Form.Field
        label="Purchase Flow"
        disabled={
          paypalInitializing ||
          !paymentPlanId ||
          !paypalClientId ||
          !countryCode
        }
      ></Form.Field>
      <Form.Radio
        disabled={
          paypalInitializing ||
          !paymentPlanId ||
          !paypalClientId ||
          !countryCode
        }
        label="Popup"
        name="purchaseFlow"
        checked={purchaseFlow === 'POPUP'}
        onChange={() => changePurchaseFlow('POPUP')}
      ></Form.Radio>
      <Form.Radio
        disabled={
          paypalInitializing ||
          !paymentPlanId ||
          !paypalClientId ||
          !countryCode
        }
        label="Redirect"
        name="purchaseFlow"
        checked={purchaseFlow === 'REDIRECT'}
        onChange={() => changePurchaseFlow('REDIRECT')}
      ></Form.Radio>
      {purchaseFlow === 'POPUP' ? (
        <div id="paypal-btn-container" style={{ width: '300px' }}></div>
      ) : (
        <Button
          disabled={
            !paymentPlanId || !paypalClientId || !countryCode || !purchaseFlow
          }
          style={{ width: '300px' }}
          primary
          onClick={async () => {
            subscribeToPaymentPlan();
          }}
        >
          Subscribe
        </Button>
      )}
    </>
  );
};
