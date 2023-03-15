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
  subscribeRedirectMutation,
  getPaymentPlansQuery,
} from './graphql-documents';
import { ScenarioKey } from '../../../scenario-registry';
import { setupPaypal } from './paypal-utils';

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

type PurchaseFlow = 'POPUP' | 'REDIRECT';

export const SubscribeToSubscriptionPlanPayPal: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[] | null>(null);
  const [paymentPlanId, setPaymentPlanId] = useState<string>('');
  const [paymentPlanPrices, setPaymentPlanPrices] = useState<
    PaymentPlanPrice[] | null
  >(null);
  const [countryCode, setCountryCode] = useState<string>('');
  const [purchaseFlow, setPurchaseFlow] = useState<PurchaseFlow | null>(null);
  const [paypalInitializing, setPaypalInitializing] = useState<boolean>(false);

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.billingServiceBaseURL).href,
  );
  const scenarioId: ScenarioKey = 'subscribe-to-subscription-plan-paypal';

  useEffect(() => {
    const pathname = window.location.pathname;

    if (pathname.endsWith('subscribe-success')) {
      const urlParams = new URLSearchParams(window.location.search);
      const subscriptionId = urlParams.get('subscriptionId');
      logger.log('Redirection from PayPal detected.');
      logger.log(
        `Subscription with ID ${subscriptionId} should be active now. You can verify it by using the 'List User Subscriptions' scenario.`,
      );
    } else if (pathname.endsWith('subscribe-cancelled')) {
      logger.log('Redirection from PayPal detected.');
      logger.log('The subscription is cancelled by the user.');
    } else if (pathname.endsWith('subscribe-error')) {
      logger.log('Redirection from PayPal detected.');
      logger.log('An error occurred in the subscription.');
    }
  }, [logger]);

  const fetchPaymentPlansAndPaypalSettings = async (): Promise<void> => {
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

      logger.log(
        'method [fetchPaymentPlansAndPaypalSettings]',
        'output:',
        result.data,
      );
      if (result.errors) {
        logger.error(result.errors);
      } else {
        setPaymentPlans(result.data.paymentPlans.nodes);
        setPaymentPlanId('');

        const paypalSettings = result.data.paypalSettings.nodes;
        if (Array.isArray(paypalSettings) && paypalSettings.length > 0) {
          setPaypalClientId(paypalSettings[0].clientId);
          setPurchaseFlow(null);
        } else {
          logger.error('Unable to fetch PayPal settings.');
        }
      }
    } catch (error) {
      setPaymentPlans(null);
      setPaymentPlanId('');
      setPaypalClientId(null);
      setPurchaseFlow(null);

      if (error instanceof Error) {
        logger.error(
          'method [fetchPaymentPlansAndPaypalSettings]',
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

      logger.log('method [fetchPaymentPlanPrices]', 'output:', result.data);
      if (result.errors) {
        logger.error(result.errors);
      } else {
        setPaymentPlanPrices(result.data.paymentPlan.prices.nodes);
        setCountryCode('');
      }
    } catch (error) {
      setPaymentPlanPrices(null);
      setCountryCode('');
      if (error instanceof Error) {
        logger.error(
          'method [fetchPaymentPlanPrices]',
          'output:',
          error.message,
        );
      }
    }
  };

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
              'method [changePurchaseFlow]',
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

        logger.log('method [subscribeToPaymentPlan]', 'output:', result.data);
        if (result.errors) {
          logger.error(result.errors);
        } else {
          window.location.href = result.data.paypalSubscribe.approveUrl;
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(
            'method [subscribeToPaymentPlan]',
            'output:',
            error.message,
          );
        }
      }
    }
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">
          Subscribe to a Subscription Plan (with PayPal)
        </Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>billing-service & monetization-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates the sequence of actions a user would take
            to Subscribe to a Subscription Plan using PayPal as the Payment
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
              fetchPaymentPlansAndPaypalSettings();
            }}
          >
            Fetch Payment Plans & PayPal Settings
          </Button>

          <Divider />

          <Form.Dropdown
            disabled={!paymentPlans || !paypalClientId}
            fluid
            selection
            width={4}
            label="Subscription Plans with PayPal Purchase"
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
              setPurchaseFlow(null);
              await fetchPaymentPlanPrices(paymentPlanId);
            }}
          ></Form.Dropdown>

          <Form.Dropdown
            disabled={!paymentPlanPrices || !paypalClientId}
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
              setPurchaseFlow(null);
            }}
          ></Form.Dropdown>

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
                !paymentPlanId ||
                !paypalClientId ||
                !countryCode ||
                !purchaseFlow
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
        </Form>
      </Segment>
    </>
  );
};
