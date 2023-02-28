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
  CancelSubscriptionMutation,
  getAllSubscriptionsQuery,
} from './graphql-documents';

interface Subscription {
  id: string;
  lifecycleStatus: string;
  subscriptionPlan: {
    title: string;
  };
  paymentPlan: {
    title: string;
  };
}

export const UnsubscribeFromSubscriptionPlan: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(
    null,
  );
  const [subscriptionId, setSubscriptionId] = useState<string>('');

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.billingServiceBaseURL).href,
  );

  const fetchAllSubscriptions = async (): Promise<void> => {
    try {
      const result = await apolloClient.query({
        query: getAllSubscriptionsQuery,
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      logger.log(
        `method [${fetchAllSubscriptions.name}]`,
        'output:',
        result.data,
      );

      if (result.errors) {
        logger.error(result.errors);
      } else {
        setSubscriptions(result.data.subscriptions.nodes);
        setSubscriptionId('');
      }
    } catch (error) {
      setSubscriptions(null);
      setSubscriptionId('');

      if (error instanceof Error) {
        logger.error(
          `method [${fetchAllSubscriptions.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  const unsubscribeFromSubscriptionPlan = async (): Promise<void> => {
    try {
      const result = await apolloClient.mutate({
        mutation: CancelSubscriptionMutation,
        variables: {
          input: {
            subscriptionId,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      if (result.errors) {
        logger.error(
          `method [${unsubscribeFromSubscriptionPlan.name}]`,
          'output:',
          result.errors,
        );
      } else {
        logger.log(
          `method [${unsubscribeFromSubscriptionPlan.name}]`,
          'output:',
          result.data,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `method [${unsubscribeFromSubscriptionPlan.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">Unsubscribe from a Subscription Plan</Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>billing-service & monetization-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            The scenario demonstrates how to unsubscribe from the active
            subscription of a logged-in user.
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

          <Button
            primary
            onClick={async () => {
              fetchAllSubscriptions();
            }}
          >
            Fetch All Subscriptions
          </Button>

          <Divider />

          <Form.Dropdown
            fluid
            search
            selection
            width={4}
            label="Subscription"
            placeholder="Select a subscription"
            options={
              subscriptions?.map((subscription) => {
                return {
                  text: `[${subscription.subscriptionPlan.title}] ${subscription.paymentPlan.title} (${subscription.lifecycleStatus})`,
                  value: subscription.id,
                };
              }) ?? []
            }
            onChange={(event, { value }) => {
              setSubscriptionId(value as string);
            }}
          ></Form.Dropdown>

          <Button
            disabled={!subscriptionId}
            primary
            onClick={async () => {
              unsubscribeFromSubscriptionPlan();
            }}
          >
            Unsubscribe
          </Button>
        </Form>
      </Segment>
    </>
  );
};
