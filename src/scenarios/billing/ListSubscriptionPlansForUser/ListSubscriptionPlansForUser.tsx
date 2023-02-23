import { useState } from 'react';
import {
  Button,
  Container,
  Divider,
  Form,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { getApolloClient } from '../../../apollo-client';
import {
  getSubscriptionPlansQuery,
  getActiveSubscriptionQuery,
} from './graphql-documents';
import * as countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(en);

export const ListSubscriptionPlansForUser: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [countryCode, setCountryCode] = useState<string>('');

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.billingServiceBaseURL).href,
  );

  const listSubscriptionPlansForUser = async (): Promise<void> => {
    let subscriptionFilter;
    let subscriptionPlanFilter;
    let paymentPlanPriceFilter;

    if (countryCode !== '') {
      subscriptionFilter = {
        country: { equalTo: countryCode },
      };
      subscriptionPlanFilter = {
        paymentPlans: {
          every: {
            prices: { some: { country: { equalTo: countryCode } } },
          },
        },
      };
      paymentPlanPriceFilter = { country: { equalTo: countryCode } };
    }

    let activeSubscription;
    try {
      const activeSubResult = await apolloClient.query({
        query: getActiveSubscriptionQuery,
        variables: {
          subscriptionFilter,
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      if (activeSubResult.errors) {
        logger.error(
          `method [${listSubscriptionPlansForUser.name}]`,
          'output:',
          activeSubResult.errors,
        );
      } else {
        const subscriptions = activeSubResult.data.subscriptions.nodes;
        if (Array.isArray(subscriptions) && subscriptions.length > 0) {
          activeSubscription = subscriptions[0];

          if (subscriptionPlanFilter) {
            subscriptionPlanFilter = {
              ...subscriptionPlanFilter,
              id: { notEqualTo: activeSubscription.subscriptionPlan.id },
            };
          } else {
            subscriptionPlanFilter = {
              id: { notEqualTo: activeSubscription.subscriptionPlan.id },
            };
          }
        }
      }

      const availableSubResult = await apolloClient.query({
        query: getSubscriptionPlansQuery,
        variables: {
          subscriptionPlanFilter,
          paymentPlanPriceFilter,
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      if (availableSubResult.errors) {
        logger.error(
          `method [${listSubscriptionPlansForUser.name}]`,
          'output:',
          availableSubResult.errors,
        );
      } else {
        if (activeSubscription) {
          logger.log(
            `method [${listSubscriptionPlansForUser.name}]`,
            'output: The user has an active subscription: ',
            activeSubscription,
            'Other available subscription plans: ',
            availableSubResult.data.subscriptionPlans.nodes,
          );
        } else {
          logger.log(
            `method [${listSubscriptionPlansForUser.name}]`,
            'output: The user does not have an active subscription.',
            'Available subscription plans: ',
            availableSubResult.data.subscriptionPlans.nodes,
          );
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `method [${listSubscriptionPlansForUser.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">List Subscription Plans for a User</Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>billing-service & monetization-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to retrieve the current subscription
            details of the user (if any), and also will list the other available
            subscription plans the user can subscribe to.
          </p>

          <p>
            If the user is not already signed-in, you can use one of the Sign-In
            scenarios.
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

          <Form.Dropdown
            fluid
            search
            selection
            width={4}
            label="Country"
            placeholder="Select a country"
            options={
              Object.entries(countries.getNames('en')).map((entry) => {
                return {
                  text: `${entry[1]} (${entry[0]})`,
                  value: entry[0],
                };
              }) ?? []
            }
            onChange={(event, { value }) => {
              setCountryCode(value as string);
            }}
          ></Form.Dropdown>

          <Button
            primary
            onClick={async () => {
              listSubscriptionPlansForUser();
            }}
          >
            List Subscription Plans
          </Button>
        </Form>
      </Segment>
    </>
  );
};
