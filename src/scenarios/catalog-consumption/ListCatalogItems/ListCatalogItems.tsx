import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import { DocumentNode } from 'graphql';
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
  getAllChannelsQuery,
  getAllItemsQuery,
  getAllMoviesQuery,
  getAllTvShowsQuery,
} from './graphql-documents';
import { useState } from 'react';

export const ListCatalogItems: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [locale, setLocale] = useState<string>('');

  const fetchAndLogCatalogItems = async (
    gqlDocument: DocumentNode,
  ): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.catalogServiceBaseURL).href,
      );

      const result = await apolloClient.query({
        context: {
          headers:
            locale !== ''
              ? {
                  'mosaic-locale': locale,
                }
              : undefined,
        },
        query: gqlDocument,
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
        <Header size="huge">List Catalog Items</Header>
        <Header size="small">
          Required Services:
          <Label>catalog-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to retrieve and show a list of
            published media entities from the Catalog Service, such as movies or
            TV shows.
          </p>
        </Container>

        <Divider />

        <Form>
          <Form.Group>
            <Form.Input
              width={4}
              icon="globe"
              iconPosition="left"
              label="Locale"
              value={locale}
              onChange={(event) => {
                setLocale(event.target.value);
              }}
            />
          </Form.Group>
        </Form>

        <Divider />

        <Button
          primary
          onClick={async () => {
            fetchAndLogCatalogItems(getAllItemsQuery);
          }}
        >
          List All Items
        </Button>

        <Divider />

        <Button
          primary
          onClick={async () => {
            fetchAndLogCatalogItems(getAllMoviesQuery);
          }}
        >
          List All Movies
        </Button>

        <Divider />

        <Button
          primary
          onClick={async () => {
            fetchAndLogCatalogItems(getAllTvShowsQuery);
          }}
        >
          List All TV Shows
        </Button>

        <Divider />

        <Button
          primary
          onClick={async () => {
            fetchAndLogCatalogItems(getAllChannelsQuery);
          }}
        >
          List All Channels
        </Button>
      </Segment>
    </>
  );
};
