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
import {
  ArrayItem,
  ArrayItemsPage,
  SortDirection,
  sortDirectionOptions,
  SortProperty,
  sortPropertyOptions,
} from '../ArrayCommon/array-item';
import { CatalogEntity, fetchCatalogEntities } from '../ArrayCommon/catalog';
import { FAVORITES_KEY, FAVORITES_SCOPE } from '../ArrayCommon/constants';
import { logGraphQLError } from '../ArrayCommon/log-graphql-error';
import { lookupArrayItemsQuery } from './graphql-documents';

interface LookupResult {
  totalCount: number;
  /** Found items of all pages fetched so far. */
  items: ArrayItem[];
  endCursor: string | null;
  hasNextPage: boolean;
}

export const ArrayLookupFavorites: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const [entityArray, setEntityArray] = useState<CatalogEntity[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [idsText, setIdsText] = useState<string>('');
  const [sort, setSort] = useState<SortProperty>('sortString');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [lookupResult, setLookupResult] = useState<LookupResult>();

  const selectedIds = idsText.split(/[\s,]+/).filter((id) => id !== '');

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

  const lookupFavorites = async (after?: string): Promise<void> => {
    try {
      const result = await apolloClientPersonalization.query<{
        lookupArrayItems: ArrayItemsPage;
      }>({
        query: lookupArrayItemsQuery,
        variables: {
          input: {
            scope: FAVORITES_SCOPE,
            key: FAVORITES_KEY,
            // `itemIds` and `ids` form a union (max. 100 selectors combined).
            itemIds: selectedItemIds,
            ids: selectedIds,
            sort,
            sortDirection,
            // The cursor is bound to the selectors, sort and sortDirection of the first request.
            after,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      const { totalCount, data, pageInfo } = result.data.lookupArrayItems;
      setLookupResult((previous) => ({
        totalCount,
        items:
          after === undefined || previous === undefined
            ? data
            : [...previous.items, ...data],
        endCursor: pageInfo.endCursor,
        hasNextPage: pageInfo.hasNextPage,
      }));
      logger.log(`method [${lookupFavorites.name}]`, 'output:', result.data);
    } catch (error) {
      logGraphQLError(logger, lookupFavorites.name, error);
    }
  };

  // Results are found-only and sorted by the requested sort, not aligned to the selector order.
  // Associate results with the requested selectors by `itemId` / `id`.
  const notFoundItemIds =
    lookupResult === undefined || lookupResult.hasNextPage
      ? []
      : selectedItemIds.filter(
          (itemId) =>
            !lookupResult.items.some((item) => item.itemId === itemId),
        );
  const notFoundIds =
    lookupResult === undefined || lookupResult.hasNextPage
      ? []
      : selectedIds.filter(
          (id) => !lookupResult.items.some((item) => item.id === id),
        );

  return (
    <Segment basic>
      <Header size="huge">Array: Lookup Favorites</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>catalog-service</Label>
        <Label>personalization-service</Label>
      </Header>

      <RecommendedApiNotice>
        <p>
          <code>lookupArrayItems</code> replaces reading the whole array with
          the deprecated <code>getArray</code> query and scanning it on the
          client (as done in <ScenarioLink shortId="array-add-favorites" />
          ).
        </p>
      </RecommendedApiNotice>

      <Divider />

      <Container fluid>
        <p>
          The scenario shows how to check which of the given items are favorites
          of the user, for example to render a &quot;favorite&quot; indicator on
          catalog tiles.
        </p>
        <p>
          Items are selected by customer-owned <code>itemIds</code> (here: the
          catalog entity IDs), by service-generated <code>ids</code>, or both.
          The two selector lists form a union and may contain at most 100
          selectors combined. Unknown selectors are omitted from the result.
          Results follow the requested sort order, not the selector order.
        </p>
        <p>
          Favorites added with the deprecated <code>setArrayItem</code> have no
          stored <code>itemId</code>, but are still found by{' '}
          <code>itemIds</code> because their <code>value.id</code> holds the
          catalog entity ID. Legacy duplicates are returned as separate rows.
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
                label="Item IDs (itemIds)"
                placeholder="Select catalog entities"
                options={entityArray.map((entity) => ({
                  text: `${entity.type}: ${entity.title}`,
                  value: entity.id,
                }))}
                value={selectedItemIds}
                onChange={(event, { value }) => {
                  setSelectedItemIds(value as string[]);
                  setLookupResult(undefined);
                }}
              />

              <Form.TextArea
                label="Service-generated IDs (ids), comma or newline separated"
                placeholder="66b100000000000000000001"
                rows={2}
                value={idsText}
                onChange={(event, { value }) => {
                  setIdsText(String(value ?? ''));
                  setLookupResult(undefined);
                }}
              />

              <Form.Group widths="equal">
                <Form.Dropdown
                  fluid
                  selection
                  label="Sort"
                  options={sortPropertyOptions}
                  value={sort}
                  onChange={(event, { value }) => {
                    setSort(value as SortProperty);
                    setLookupResult(undefined);
                  }}
                />
                <Form.Dropdown
                  fluid
                  selection
                  label="Sort Direction"
                  options={sortDirectionOptions}
                  value={sortDirection}
                  onChange={(event, { value }) => {
                    setSortDirection(value as SortDirection);
                    setLookupResult(undefined);
                  }}
                />
              </Form.Group>

              <Form.Group>
                <Form.Button
                  primary
                  onClick={async () => {
                    lookupFavorites();
                  }}
                  disabled={
                    selectedItemIds.length === 0 && selectedIds.length === 0
                  }
                >
                  Lookup Favorites
                </Form.Button>
                <Form.Button
                  primary
                  onClick={async () => {
                    lookupFavorites(lookupResult?.endCursor ?? undefined);
                  }}
                  disabled={lookupResult?.hasNextPage !== true}
                >
                  Fetch Next Page
                </Form.Button>
              </Form.Group>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>

      {lookupResult !== undefined && (
        <>
          <Divider />
          <Header size="small">
            Found Favorites
            <Label>totalCount: {lookupResult.totalCount}</Label>
            <Label>
              hasNextPage: {lookupResult.hasNextPage ? 'true' : 'false'}
            </Label>
          </Header>
          <ArrayItemsTable items={lookupResult.items} />
          {(notFoundItemIds.length > 0 || notFoundIds.length > 0) && (
            <Container fluid>
              <p>
                <b>Not favorites:</b>{' '}
                {[...notFoundItemIds, ...notFoundIds].join(', ')}
              </p>
            </Container>
          )}
        </>
      )}
    </Segment>
  );
};
