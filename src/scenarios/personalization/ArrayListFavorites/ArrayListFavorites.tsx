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
  ArrayItemsPage,
  SortDirection,
  sortDirectionOptions,
  SortProperty,
  sortPropertyOptions,
} from '../ArrayCommon/array-item';
import { FAVORITES_KEY, FAVORITES_SCOPE } from '../ArrayCommon/constants';
import { logGraphQLError } from '../ArrayCommon/log-graphql-error';
import { listArrayItemsQuery } from './graphql-documents';

export const ArrayListFavorites: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const [first, setFirst] = useState<string>('20');
  const [sort, setSort] = useState<SortProperty>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [page, setPage] = useState<ArrayItemsPage>();
  const [pageNumber, setPageNumber] = useState<number>(0);

  const apolloClient = useMemo(
    () =>
      getApolloClient(
        new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
      ),
    [activeProfile.personalizationServiceBaseURL],
  );

  // A cursor is bound to the scope, key, sort and sortDirection it was issued for.
  // Reusing it with a different sort fails with `CURSOR_CONSTRAINT`, so start over from the first page.
  const resetTraversal = (): void => {
    setPage(undefined);
    setPageNumber(0);
  };

  const fetchPage = async (after?: string): Promise<void> => {
    try {
      const result = await apolloClient.query<{
        listArrayItems: ArrayItemsPage;
      }>({
        query: listArrayItemsQuery,
        variables: {
          input: {
            scope: FAVORITES_SCOPE,
            key: FAVORITES_KEY,
            // `first` is not bound to the cursor and may change between pages (1-500, default 20).
            first: first === '' ? undefined : Number(first),
            // Pass the previous page's `endCursor` unchanged. Omit it to start from the beginning.
            after,
            sort,
            sortDirection,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      setPage(result.data.listArrayItems);
      setPageNumber((current) => (after === undefined ? 1 : current + 1));
      logger.log(`method [${fetchPage.name}]`, 'output:', result.data);
    } catch (error) {
      logGraphQLError(logger, fetchPage.name, error);
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Array: List Favorites</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>personalization-service</Label>
      </Header>

      <RecommendedApiNotice>
        <p>
          <code>listArrayItems</code> replaces the deprecated{' '}
          <code>getArray</code> query (see{' '}
          <ScenarioLink shortId="array-get-favorites" />
          ). It uses forward-only cursor pagination (<code>first</code> /{' '}
          <code>after</code>) instead of offset pagination (<code>skip</code> /{' '}
          <code>take</code>).
        </p>
      </RecommendedApiNotice>

      <Divider />

      <Container fluid>
        <p>
          The scenario shows how to traverse all favorite items of the user page
          by page.
        </p>
        <p>
          Each page returns <code>pageInfo.endCursor</code>. Pass it as{' '}
          <code>after</code> to fetch the next page while keeping{' '}
          <code>sort</code> and <code>sortDirection</code> unchanged. Treat the
          cursor as an opaque token: never decode, construct or store it as an
          item identity. <code>first</code> may change between pages and must be
          between 1 and 500.
        </p>
        <p>
          <code>totalCount</code> describes the complete array and is not
          snapshot-consistent with the returned page. Items without the selected
          sort field are still returned; ties are ordered by the
          service-generated <code>id</code>.
        </p>
        <p>
          To check whether specific items are in the array, use{' '}
          <ScenarioLink shortId="array-lookup-favorites" /> instead of
          traversing the whole array.
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

              <Form.Input
                type="number"
                label="Page Size (first)"
                value={first}
                onChange={(event, { value }) => setFirst(value)}
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
                    resetTraversal();
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
                    resetTraversal();
                  }}
                />
              </Form.Group>

              <Form.Group>
                <Form.Button
                  primary
                  onClick={async () => {
                    fetchPage();
                  }}
                >
                  Fetch First Page
                </Form.Button>
                <Form.Button
                  primary
                  onClick={async () => {
                    fetchPage(page?.pageInfo.endCursor ?? undefined);
                  }}
                  disabled={page?.pageInfo.hasNextPage !== true}
                >
                  Fetch Next Page
                </Form.Button>
              </Form.Group>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>

      {page !== undefined && (
        <>
          <Divider />
          <Header size="small">
            Page {pageNumber}
            <Label>totalCount: {page.totalCount}</Label>
            <Label>
              hasNextPage: {page.pageInfo.hasNextPage ? 'true' : 'false'}
            </Label>
          </Header>
          <ArrayItemsTable items={page.data} />
        </>
      )}
    </Segment>
  );
};
