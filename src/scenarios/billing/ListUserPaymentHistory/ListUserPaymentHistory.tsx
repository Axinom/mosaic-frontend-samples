import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { useState } from 'react';
import {
  Container,
  Divider,
  Form,
  Grid,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import { getApolloClient } from '../../../apollo-client';
import { getSubscriptionTransactionsQuery } from './graphql-documents';

export const ListUserPaymentHistory: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.billingServiceBaseURL).href,
  );

  const fetchTransactionHistory = async (): Promise<void> => {
    try {
      const result = await apolloClient.query({
        query: getSubscriptionTransactionsQuery,
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
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          'method [fetchPaymentPlansAndPaypalSettings]',
          'output:',
          error.message,
        );
      } else {
        logger.error(
          'method [fetchApplicationToken]',
          'output:',
          JSON.stringify(error),
        );
      }
    }
  };

  return (
    <Segment basic>
      <Header size="huge">List User Payment History</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>billing-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>This scenario demonstrates all user payment history.</p>
      </Container>

      <Divider />

      <Grid divided>
        <Grid.Column width={8}>
          <Segment basic>
            <Form>
              <Form.Input
                control={VariableSearch}
                icon="key"
                label="User Access Token"
                value={userAccessToken}
                setStateValue={setUserAccessToken}
              />

              <Divider />

              <Form.Button primary onClick={fetchTransactionHistory}>
                Fetch Transaction History
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};
