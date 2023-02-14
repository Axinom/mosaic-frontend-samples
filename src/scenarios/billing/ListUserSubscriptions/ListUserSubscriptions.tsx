import { useState } from 'react';
import {
  Container,
  Divider,
  Form,
  Header,
  Label,
  Segment,
  Button,
} from 'semantic-ui-react';
import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { getApolloClient } from '../../../apollo-client';
import { getAllSubscriptionsQuery } from './graphql-documents';

export const ListUserSubscriptions: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.billingServiceBaseURL).href,
  );

  const listUserSubscriptions = async (): Promise<void> => {
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
        `method [${listUserSubscriptions.name}]`,
        'output:',
        result.data,
      );

      if (result.errors) {
        logger.error(result.errors);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `method [${listUserSubscriptions.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">List User Subscriptions</Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>billing-service & monetization-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to retrieve and show a list of all
            subscriptions belonging to the signed-in user.
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
              listUserSubscriptions();
            }}
          >
            List All Subscriptions
          </Button>
        </Form>
      </Segment>
    </>
  );
};
