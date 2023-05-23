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
  getPaymentPlanDetailsQuery,
  getPaymentPlansQuery,
} from './graphql-documents';
import { ScenarioKey } from '../../../scenario-registry';
import { PaypalPaymentProvider } from './PaypalPaymentProvider/PaypalPaymentProvider';
import { StripePaymentProvider } from './StripePaymentProvider/StripePaymentProvider';

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

type PaymentProviderKey = 'PAYPAL' | 'CPC_STRIPE';

interface PaymentProvider {
  key: PaymentProviderKey;
  title: string;
}

const allPaymentProviders: PaymentProvider[] = [
  {
    key: 'PAYPAL',
    title: 'PayPal',
  },
  {
    key: 'CPC_STRIPE',
    title: 'Stripe',
  },
];

export const SubscribeToSubscriptionPlan: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>('');
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[] | null>(null);
  const [paymentPlanId, setPaymentPlanId] = useState<string>('');
  const [paymentPlanPrices, setPaymentPlanPrices] = useState<
    PaymentPlanPrice[] | null
  >(null);
  const [paymentProviders, setPaymentProviders] = useState<
    PaymentProvider[] | null
  >(null);
  const [countryCode, setCountryCode] = useState<string>('');
  const [paymentProviderKey, setPaymentProviderKey] = useState<
    PaymentProviderKey | ''
  >('');

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.billingServiceBaseURL).href,
  );
  const scenarioId: ScenarioKey = 'subscribe-to-subscription-plan';

  useEffect(() => {
    const pathname = window.location.pathname;

    if (pathname.endsWith('subscribe-success')) {
      const urlParams = new URLSearchParams(window.location.search);
      const subscriptionId =
        urlParams.get('subscriptionId') ?? urlParams.get('subscription_id');
      logger.log('Redirection from payment provider detected.');
      logger.log(
        `Subscription with ID ${subscriptionId} should be active now. You can verify it by using the 'List User Subscriptions' scenario.`,
      );
    } else if (pathname.endsWith('subscribe-cancelled')) {
      logger.log('Redirection from payment provider detected.');
      logger.log(
        "The operation was cancelled by the user. The Billing Service subscription status will be changed to 'CANCELLED' eventually.",
      );
    } else if (pathname.endsWith('subscribe-error')) {
      logger.log('Redirection from payment provider detected.');
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
        setPaymentPlanPrices(null);
        setCountryCode('');
        setPaymentProviders(null);
        setPaymentProviderKey('');
      }
    } catch (error) {
      setPaymentPlans(null);
      setPaymentPlanId('');
      setPaymentPlanPrices(null);
      setCountryCode('');
      setPaymentProviders(null);
      setPaymentProviderKey('');

      if (error instanceof Error) {
        logger.error(
          `method [${fetchPaymentPlans.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  const fetchPaymentPlanDetails = async (
    paymentPlanId: string,
  ): Promise<void> => {
    try {
      const result = await apolloClient.query({
        query: getPaymentPlanDetailsQuery,
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
        `method [${fetchPaymentPlanDetails.name}]`,
        'output:',
        result.data,
      );
      if (result.errors) {
        logger.error(result.errors);
      } else {
        setPaymentPlanPrices(result.data.paymentPlan.prices.nodes);
        setCountryCode('');

        const providerConfigs = result.data.paymentPlan.providerConfigs.nodes;
        if (Array.isArray(providerConfigs) && providerConfigs.length > 0) {
          const providerConfigKeys = providerConfigs.map(
            (config) => config.paymentProviderKey,
          );

          setPaymentProviders(
            allPaymentProviders.filter((provider) =>
              providerConfigKeys.includes(provider.key),
            ),
          );
        }

        setPaymentProviderKey('');
      }
    } catch (error) {
      setPaymentPlanPrices(null);
      setCountryCode('');
      setPaymentProviders(null);
      setPaymentProviderKey('');

      if (error instanceof Error) {
        logger.error(
          `method [${fetchPaymentPlanDetails.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">Subscribe to a Subscription Plan</Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>billing-service & monetization-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates the sequence of actions a user would take
            to Subscribe to a Subscription Plan using PayPal or Stripe as the
            Payment Provider.
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
            label="Subscription Plans"
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
              await fetchPaymentPlanDetails(paymentPlanId);
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
            value={countryCode}
            onChange={(event, { value }) => {
              setCountryCode(value as string);
            }}
          ></Form.Dropdown>

          <Form.Dropdown
            disabled={!paymentProviders}
            fluid
            selection
            width={4}
            label="Payment Provider"
            placeholder="Select an option"
            options={
              paymentProviders?.map((provider) => {
                return {
                  text: provider.title,
                  value: provider.key,
                };
              }) ?? []
            }
            value={paymentProviderKey}
            onChange={(event, { value }) => {
              setPaymentProviderKey(value as PaymentProviderKey);
            }}
          ></Form.Dropdown>

          {paymentProviderKey === 'PAYPAL' && (
            <PaypalPaymentProvider
              userAccessToken={userAccessToken}
              paymentPlanId={paymentPlanId}
              countryCode={countryCode}
              apolloClient={apolloClient}
            />
          )}
          {paymentProviderKey === 'CPC_STRIPE' && (
            <StripePaymentProvider
              userAccessToken={userAccessToken}
              paymentPlanId={paymentPlanId}
              currencyCode={
                paymentPlanPrices?.find(
                  (option) => option.country === countryCode,
                )?.currency ?? ''
              }
            />
          )}
        </Form>
      </Segment>
    </>
  );
};
