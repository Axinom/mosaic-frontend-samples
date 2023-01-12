import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
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
import { getApolloClient } from '../../../apollo-client';
import { getAllItemsQuery } from './graphql-documents';

export const GetSingleItem: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [entityId, setEntityId] = useState<string>('');

  const fetchAndLogCatalogItems = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.catalogServiceBaseURL).href,
      );

      const result = await apolloClient.query({
        query: getAllItemsQuery,
        variables: {
          id: entityId,
        },
        fetchPolicy: 'no-cache',
      });

      logger.log('calling [fetchAndLogCatalogItems]', 'output:', result.data);
      if (result.errors) {
        logger.error(
          'calling [fetchAndLogCatalogItems]',
          'output:',
          result.errors,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          'calling [fetchAndLogCatalogItems]',
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">Get Single Item</Header>
        <Header size="small">
          Required Services:
          <Label>catalog-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to retrieve and show details of a
            published media entity from the Catalog Service, such as a movie or
            a TV show.
          </p>
        </Container>

        <Divider />

        <Form>
          <Form.Group>
            <Form.Input
              control={VariableSearch}
              width={4}
              icon="id card outline"
              label="Entity ID"
              value={entityId}
              setStateValue={setEntityId}
            />
          </Form.Group>

          <Button
            primary
            onClick={async () => {
              fetchAndLogCatalogItems();
            }}
          >
            Get Entity Details
          </Button>
        </Form>
      </Segment>
    </>
  );
};
