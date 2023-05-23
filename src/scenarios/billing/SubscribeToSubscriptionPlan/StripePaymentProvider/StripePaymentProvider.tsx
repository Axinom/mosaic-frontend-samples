import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import { Button } from 'semantic-ui-react';

export interface StripePaymentProviderProps {
  userAccessToken: string;
  paymentPlanId: string;
  currencyCode: string;
}

export const StripePaymentProvider: React.FC<StripePaymentProviderProps> = ({
  userAccessToken,
  paymentPlanId,
  currencyCode,
}) => {
  const { activeProfile, logger } = useScenarioHost();

  const subscribeToPaymentPlan = async (): Promise<void> => {
    try {
      const startCheckoutUrl = new URL(
        'start-checkout',
        activeProfile.stripePaymentConnectorBaseURL,
      ).href;
      const result = await fetch(startCheckoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + userAccessToken,
        },
        body: JSON.stringify({ paymentPlanId, currency: currencyCode }),
      });
      const data = await result.json();
      logger.log(`method [${subscribeToPaymentPlan.name}]`, 'output:', data);

      window.location.href = data.redirectUrl;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `method [${subscribeToPaymentPlan.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <>
      <Button
        disabled={!paymentPlanId || !currencyCode}
        style={{ width: '170px' }}
        primary
        onClick={async () => {
          subscribeToPaymentPlan();
        }}
      >
        Subscribe
      </Button>
    </>
  );
};
