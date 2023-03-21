import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Divider,
  Form,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import { getApolloClient } from '../../../apollo-client';
import {
  getPaymentPlanPricesQuery,
  getPaymentPlansQuery,
} from './graphql-documents';
import { ScenarioKey } from '../../../scenario-registry';

interface PaymentPlan {
  id: string;
  title: string;
  periodQuantity: number;
  periodUnit: string;
  subscriptionPlan: {
    title: string;
  };
}

interface PaymentPlanPrice {
  country: string;
  currency: string;
  price: string;
}

export const SubscribeToSubscriptionPlanStripe: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[] | null>(null);
  const [paymentPlanId, setPaymentPlanId] = useState<string>('');
  const [paymentPlanPrices, setPaymentPlanPrices] = useState<
    PaymentPlanPrice[] | null
  >(null);
  const [currencyCode, setCurrencyCode] = useState<string>('');

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.billingServiceBaseURL).href,
  );
  const scenarioId: ScenarioKey = 'subscribe-to-subscription-plan-stripe';

  useEffect(() => {
    const pathname = window.location.pathname;

    if (pathname.endsWith('subscribe-success')) {
      const urlParams = new URLSearchParams(window.location.search);
      const subscriptionId = urlParams.get('subscription_id');
      logger.log('Redirection from Stripe detected.');
      logger.log(
        `Subscription with ID ${subscriptionId} should be active now. You can verify it by using the 'List User Subscriptions' scenario.`,
      );
    } else if (pathname.endsWith('subscribe-cancelled')) {
      logger.log('Redirection from Stripe detected.');
      logger.log(
        "The operation was cancelled by the user. The Billing Service subscription status will be changed to 'CANCELLED' eventually.",
      );
    } else if (pathname.endsWith('subscribe-error')) {
      logger.log('Redirection from Stripe detected.');
      logger.log('An error occurred in the subscription.');
    }
  }, [logger]);

  const fetchPaymentPlans = async (): Promise<void> => {
    try {
      const result = await apolloClient.query({
        query: getPaymentPlansQuery,
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      logger.log(`method [${fetchPaymentPlans.name}]`, 'output:', result.data);
      if (result.errors) {
        logger.error(result.errors);
      } else {
        setPaymentPlans(result.data.paymentPlans.nodes);
        setPaymentPlanId('');
      }
    } catch (error) {
      setPaymentPlans(null);
      setPaymentPlanId('');

      if (error instanceof Error) {
        logger.error(
          `method [${fetchPaymentPlans.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  const fetchPaymentPlanPrices = async (
    paymentPlanId: string,
  ): Promise<void> => {
    try {
      const result = await apolloClient.query({
        query: getPaymentPlanPricesQuery,
        variables: {
          id: paymentPlanId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      logger.log(
        `method [${fetchPaymentPlanPrices.name}]`,
        'output:',
        result.data,
      );
      if (result.errors) {
        logger.error(result.errors);
      } else {
        setPaymentPlanPrices(result.data.paymentPlan.prices.nodes);
        setCurrencyCode('');
      }
    } catch (error) {
      setPaymentPlanPrices(null);
      setCurrencyCode('');
      if (error instanceof Error) {
        logger.error(
          `method [${fetchPaymentPlanPrices.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

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
      <Segment basic>
        <Header size="huge">
          Subscribe to a Subscription Plan (with Stripe)
        </Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>billing-service & monetization-service</Label>
          <Label>stripe-payment-connector</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates the sequence of actions a user would take
            to Subscribe to a Subscription Plan using Stripe as the Payment
            Provider.
          </p>

          <p>
            If the user is not already signed-in, you can use one of the Sign-In
            scenarios.
          </p>

          <p>
            NOTE:
            <br />
            When configuring the Billing & Monetization Services, the following
            URLs shall be used as Redirect URLs for this scenario to work:
          </p>

          <p>
            <b>Success Redirect URL:</b>{' '}
            {encodeURI(
              `${window.location.protocol}//${window.location.host}/${scenarioId}/subscribe-success`,
            )}
            <br />
            <b>Cancel Redirect URL:</b>{' '}
            {encodeURI(
              `${window.location.protocol}//${window.location.host}/${scenarioId}/subscribe-cancelled`,
            )}
            <br />
            <b>Error Redirect URL:</b>{' '}
            {encodeURI(
              `${window.location.protocol}//${window.location.host}/${scenarioId}/subscribe-error`,
            )}
          </p>
        </Container>

        <Divider />

        <Form>
          <Form.Input
            control={VariableSearch}
            width={4}
            icon="key"
            label="User Access Token"
            value={userAccessToken}
            setStateValue={setUserAccessToken}
          />

          <Button
            primary
            onClick={async () => {
              fetchPaymentPlans();
            }}
          >
            Fetch Payment Plans
          </Button>

          <Divider />

          <Form.Dropdown
            disabled={!paymentPlans}
            fluid
            selection
            width={4}
            label="Subscription Plans with Stripe Purchase"
            placeholder="Select a subscription plan"
            options={
              paymentPlans?.map((plan) => {
                return {
                  text: `[${plan.subscriptionPlan.title}] ${plan.title} (${
                    plan.periodQuantity
                  } ${plan.periodUnit.toLocaleLowerCase()})`,
                  value: plan.id,
                };
              }) ?? []
            }
            value={paymentPlanId}
            onChange={async (event, { value }) => {
              const paymentPlanId = value as string;
              setPaymentPlanId(paymentPlanId);
              await fetchPaymentPlanPrices(paymentPlanId);
            }}
          ></Form.Dropdown>

          <Form.Dropdown
            disabled={!paymentPlanPrices}
            fluid
            selection
            width={4}
            label="Country Prices"
            placeholder="Select an option"
            options={
              paymentPlanPrices?.map((option) => {
                return {
                  text: `${option.country} [${option.price} ${option.currency}]`,
                  value: option.country,
                };
              }) ?? []
            }
            onChange={(event, { value }) => {
              const currency = paymentPlanPrices?.find(
                (option) => option.country === value,
              )?.currency;
              if (currency !== undefined) {
                setCurrencyCode(currency);
              }
            }}
          ></Form.Dropdown>

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
        </Form>
      </Segment>
    </>
  );
};
