import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { useMemo, useState } from 'react';
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
import {
  RecommendedApiNotice,
  ScenarioLink,
} from '../ArrayCommon/ArrayApiNotice';
import { ArrayItemsTable } from '../ArrayCommon/ArrayItemsTable';
import { ArrayItem, FavoriteValue } from '../ArrayCommon/array-item';
import { CatalogEntity, fetchCatalogEntities } from '../ArrayCommon/catalog';
import { FAVORITES_KEY, FAVORITES_SCOPE } from '../ArrayCommon/constants';
import { logGraphQLError } from '../ArrayCommon/log-graphql-error';
import { replaceArrayItemsMutation } from './graphql-documents';

export const ArrayReplaceFavorites: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const [entityArray, setEntityArray] = useState<CatalogEntity[]>([]);
  // Dropdown selection order is used as the favorites order.
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);

  const [replacedItems, setReplacedItems] = useState<ArrayItem[]>();

  const apolloClientCatalog = useMemo(
    () =>
      getApolloClient(
        new URL('graphql', activeProfile.catalogServiceBaseURL).href,
      ),
    [activeProfile.catalogServiceBaseURL],
  );
  const apolloClientPersonalization = useMemo(
    () =>
      getApolloClient(
        new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
      ),
    [activeProfile.personalizationServiceBaseURL],
  );

  const fetchAllCatalogItems = async (): Promise<void> => {
    try {
      const entities = await fetchCatalogEntities(
        apolloClientCatalog,
        userAccessToken,
      );
      setEntityArray(entities);
      logger.log(`method [${fetchAllCatalogItems.name}]`, 'output:', entities);
    } catch (error) {
      logGraphQLError(logger, fetchAllCatalogItems.name, error);
    }
  };

  const replaceFavorites = async (): Promise<void> => {
    try {
      const items = selectedEntityIds.map((entityId, index) => {
        const entity = entityArray.find(({ id }) => id === entityId);
        const value: FavoriteValue = { id: entityId, title: entity?.title };
        return {
          // Every item needs a unique, customer-owned `itemId`.
          itemId: entityId,
          value,
          sortString: entity?.title,
          // Persist the user-defined order, so it can be restored by sorting on `sortNumber`.
          sortNumber: index + 1,
        };
      });

      const result = await apolloClientPersonalization.mutate<{
        replaceArrayItems: { acknowledged: boolean; items: ArrayItem[] };
      }>({
        mutation: replaceArrayItemsMutation,
        variables: {
          input: {
            scope: FAVORITES_SCOPE,
            key: FAVORITES_KEY,
            items,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      setReplacedItems(result.data?.replaceArrayItems.items);
      logger.log(
        `method [${replaceFavorites.name}]`,
        'output:',
        result.data ?? {},
      );
    } catch (error) {
      logGraphQLError(logger, replaceFavorites.name, error);
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Array: Replace Favorites</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>catalog-service</Label>
        <Label>personalization-service</Label>
      </Header>

      <RecommendedApiNotice>
        <p>
          <code>replaceArrayItems</code> replaces the deprecated{' '}
          <code>setArray</code> mutation. Every item is supplied with an
          explicit, customer-owned <code>itemId</code> instead of an
          unidentified value.
        </p>
      </RecommendedApiNotice>

      <Divider />

      <Container fluid>
        <p>
          The scenario shows how to make the favorites of the user exactly match
          a given collection, for example when syncing a list that was edited
          offline or re-ordered by the user.
        </p>
        <p>
          The replacement is atomic: favorites that are not part of the request
          are removed, and a failed replacement leaves the previous array
          unchanged. Every item is recreated, so all service-generated{' '}
          <code>id</code> values change; keep using <code>itemId</code> as the
          identity. The returned items preserve the input order. Here, the
          selection order is also stored as <code>sortNumber</code>, so{' '}
          <ScenarioLink shortId="array-list-favorites" /> can return the
          favorites in that order.
        </p>
        <p>
          The <code>items</code> list must not be empty and every{' '}
          <code>itemId</code> must be unique within the request. To remove all
          favorites use the <code>deleteArray</code> mutation; to remove
          selected favorites use{' '}
          <ScenarioLink shortId="array-delete-favorites" />.
        </p>
        <p>
          If the user is not already signed-in, you can use one of the Sign-In
          scenarios.
        </p>
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

              <Form.Button
                primary
                onClick={async () => {
                  fetchAllCatalogItems();
                }}
              >
                Fetch All Catalog Items
              </Form.Button>

              <Divider />

              <Form.Dropdown
                fluid
                multiple
                search
                selection
                label="New Favorites (in order)"
                placeholder="Select catalog entities"
                options={entityArray.map((entity) => ({
                  text: `${entity.type}: ${entity.title}`,
                  value: entity.id,
                }))}
                value={selectedEntityIds}
                onChange={(event, { value }) => {
                  setSelectedEntityIds(value as string[]);
                }}
              />

              <Form.Button
                primary
                onClick={async () => {
                  replaceFavorites();
                }}
                disabled={selectedEntityIds.length === 0}
              >
                Replace Favorites
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>

      {replacedItems !== undefined && (
        <>
          <Divider />
          <Header size="small">Replaced Favorites</Header>
          <ArrayItemsTable items={replacedItems} />
        </>
      )}
    </Segment>
  );
};
