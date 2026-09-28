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
import {
  ArrayItem,
  ArrayItemsPage,
  describeValue,
} from '../ArrayCommon/array-item';
import { FAVORITES_KEY, FAVORITES_SCOPE } from '../ArrayCommon/constants';
import { logGraphQLError } from '../ArrayCommon/log-graphql-error';
import {
  deleteArrayItemsMutation,
  listArrayItemsQuery,
} from './graphql-documents';

export const ArrayDeleteFavorites: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const [favoriteArray, setFavoriteArray] = useState<ArrayItem[]>([]);
  // Selected rows, keyed by the service-generated `id` which is unique per stored item.
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [deletedCount, setDeletedCount] = useState<number>();

  const apolloClient = useMemo(
    () =>
      getApolloClient(
        new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
      ),
    [activeProfile.personalizationServiceBaseURL],
  );

  const fetchAllFavorites = async (): Promise<void> => {
    try {
      // Traverse all pages by passing each `endCursor` as `after` until `hasNextPage` is false.
      const favorites: ArrayItem[] = [];
      let after: string | undefined;
      let hasNextPage = true;
      while (hasNextPage) {
        const result = await apolloClient.query<{
          listArrayItems: ArrayItemsPage;
        }>({
          query: listArrayItemsQuery,
          variables: {
            input: {
              scope: FAVORITES_SCOPE,
              key: FAVORITES_KEY,
              first: 500,
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

        const { data, pageInfo } = result.data.listArrayItems;
        favorites.push(...data);
        after = pageInfo.endCursor ?? undefined;
        hasNextPage = pageInfo.hasNextPage;
      }

      setFavoriteArray(favorites);
      setSelectedRowIds([]);
      logger.log(`method [${fetchAllFavorites.name}]`, 'output:', favorites);
    } catch (error) {
      logGraphQLError(logger, fetchAllFavorites.name, error);
    }
  };

  const deleteFavorites = async (): Promise<void> => {
    try {
      const selectedItems = favoriteArray.filter(({ id }) =>
        selectedRowIds.includes(id),
      );
      // Prefer the customer-owned `itemId`. Legacy items without an `itemId` can only be
      // addressed by their service-generated `id`. Both lists are combined into one union.
      const itemIds = [
        ...new Set(
          selectedItems.flatMap(({ itemId }) =>
            itemId === null ? [] : [itemId],
          ),
        ),
      ];
      const ids = selectedItems
        .filter(({ itemId }) => itemId === null)
        .map(({ id }) => id);

      const result = await apolloClient.mutate<{
        deleteArrayItems: { acknowledged: boolean; deletedCount: number };
      }>({
        mutation: deleteArrayItemsMutation,
        variables: {
          input: {
            scope: FAVORITES_SCOPE,
            key: FAVORITES_KEY,
            itemIds,
            ids,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      setDeletedCount(result.data?.deleteArrayItems.deletedCount);
      logger.log(
        `method [${deleteFavorites.name}]`,
        'output:',
        result.data ?? {},
      );
      logger.log(`Updating favorites dropdown after deleting favorites.`);
      await fetchAllFavorites();
    } catch (error) {
      logGraphQLError(logger, deleteFavorites.name, error);
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Array: Delete Favorites</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>personalization-service</Label>
      </Header>

      <RecommendedApiNotice>
        <p>
          <code>deleteArrayItems</code> deletes any number of selected items in
          a single request, instead of reading the array with the deprecated{' '}
          <code>getArray</code> query and deleting items one by one (see{' '}
          <ScenarioLink shortId="array-remove-favorites" />
          ).
        </p>
      </RecommendedApiNotice>

      <Divider />

      <Container fluid>
        <p>
          The scenario shows how to remove selected items from the favorites of
          the user.
        </p>
        <p>
          Items are selected by customer-owned <code>itemIds</code>, by
          service-generated <code>ids</code>, or both (max. 100 selectors
          combined). Here, favorites with an <code>itemId</code> are deleted by{' '}
          <code>itemIds</code>; legacy favorites without one are deleted by{' '}
          <code>ids</code>. Unknown selectors are successful no-ops.
        </p>
        <p>
          <code>deletedCount</code> reports the number of stored items that were
          deleted. It can exceed the number of selected favorites, because every
          legacy duplicate matching an <code>itemId</code> is deleted. To remove
          all favorites at once, use the <code>deleteArray</code> mutation.
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
                  fetchAllFavorites();
                }}
              >
                Fetch All Favorites
              </Form.Button>

              <Divider />

              <Form.Dropdown
                fluid
                multiple
                search
                selection
                label="Favorites to Delete"
                placeholder="Select favorites"
                options={favoriteArray.map((favorite) => ({
                  text: `${describeValue(favorite.value)} (${
                    favorite.itemId === null
                      ? `id: ${favorite.id}`
                      : `itemId: ${favorite.itemId}`
                  })`,
                  value: favorite.id,
                }))}
                value={selectedRowIds}
                onChange={(event, { value }) => {
                  setSelectedRowIds(value as string[]);
                }}
              />

              <Form.Button
                primary
                onClick={async () => {
                  deleteFavorites();
                }}
                disabled={selectedRowIds.length === 0}
              >
                Delete Favorites
              </Form.Button>
            </Form>

            {deletedCount !== undefined && (
              <Header size="small">
                Last Deletion
                <Label>deletedCount: {deletedCount}</Label>
              </Header>
            )}
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};
