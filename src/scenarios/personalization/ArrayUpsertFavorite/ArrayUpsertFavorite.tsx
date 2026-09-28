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
import { upsertArrayItemMutation } from './graphql-documents';

interface UpsertArrayItemPayload {
  acknowledged: boolean;
  insertedCount: number;
  matchedCount: number;
  modifiedCount: number;
  deletedCount: number;
  item: ArrayItem;
}

/**
 * How a sort field is sent in the upsert input:
 * - `omit`: field is not sent, the stored value is preserved
 * - `clear`: field is sent as `null`, the stored value is removed
 * - `set`: field is sent with the given value
 */
type SortFieldMode = 'omit' | 'set' | 'clear';

interface SortFieldState {
  mode: SortFieldMode;
  value: string;
}

const sortFieldModeOptions: { text: string; value: SortFieldMode }[] = [
  { text: 'Omit (keep stored value)', value: 'omit' },
  { text: 'Set value', value: 'set' },
  { text: 'Clear (send null)', value: 'clear' },
];

const toSortFieldInput = <T,>(
  field: SortFieldState,
  parse: (value: string) => T,
): T | null | undefined => {
  switch (field.mode) {
    case 'omit':
      return undefined;
    case 'clear':
      return null;
    case 'set':
      return parse(field.value);
  }
};

const SortFieldInput: React.FC<{
  label: string;
  placeholder: string;
  inputType?: string;
  field: SortFieldState;
  onChange: (field: SortFieldState) => void;
}> = ({ label, placeholder, inputType, field, onChange }) => (
  <Form.Group widths="equal">
    <Form.Dropdown
      fluid
      selection
      label={label}
      options={sortFieldModeOptions}
      value={field.mode}
      onChange={(event, { value }) =>
        onChange({ ...field, mode: value as SortFieldMode })
      }
    />
    <Form.Input
      label="Value"
      type={inputType}
      placeholder={placeholder}
      value={field.value}
      disabled={field.mode !== 'set'}
      onChange={(event, { value }) => onChange({ ...field, value })}
    />
  </Form.Group>
);

export const ArrayUpsertFavorite: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const [entityArray, setEntityArray] = useState<CatalogEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [sortString, setSortString] = useState<SortFieldState>({
    mode: 'omit',
    value: '',
  });
  const [sortNumber, setSortNumber] = useState<SortFieldState>({
    mode: 'omit',
    value: '',
  });
  const [sortDate, setSortDate] = useState<SortFieldState>({
    mode: 'omit',
    value: '',
  });

  const [upsertResult, setUpsertResult] = useState<UpsertArrayItemPayload>();

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

  const selectEntity = (entityId: string): void => {
    const entity = entityArray.find(({ id }) => id === entityId);
    setSelectedEntityId(entityId);
    setTitle(entity?.title ?? '');
    setSortString({ mode: 'set', value: entity?.title ?? '' });
    setSortNumber({ mode: 'omit', value: '' });
    setSortDate({ mode: 'set', value: new Date().toISOString() });
    setUpsertResult(undefined);
  };

  const upsertFavorite = async (): Promise<void> => {
    try {
      // Keeping `value.id` equal to the `itemId` keeps the item compatible with clients
      // that still use the deprecated APIs. The recommended APIs do not require it.
      const value: FavoriteValue = { id: selectedEntityId, title };

      const result = await apolloClientPersonalization.mutate<{
        upsertArrayItem: UpsertArrayItemPayload;
      }>({
        mutation: upsertArrayItemMutation,
        variables: {
          input: {
            scope: FAVORITES_SCOPE,
            key: FAVORITES_KEY,
            // Customer-owned, stable identity. No preliminary read is needed to insert or update.
            itemId: selectedEntityId,
            value,
            sortString: toSortFieldInput(sortString, (v) => v),
            sortNumber: toSortFieldInput(sortNumber, Number),
            sortDate: toSortFieldInput(sortDate, (v) => v),
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      setUpsertResult(result.data?.upsertArrayItem);
      logger.log(
        `method [${upsertFavorite.name}]`,
        'output:',
        result.data ?? {},
      );
    } catch (error) {
      logGraphQLError(logger, upsertFavorite.name, error);
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Array: Upsert Favorite</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>catalog-service</Label>
        <Label>personalization-service</Label>
      </Header>

      <RecommendedApiNotice>
        <p>
          <code>upsertArrayItem</code> replaces the deprecated{' '}
          <code>setArrayItem</code> mutation (see{' '}
          <ScenarioLink shortId="array-add-favorites" />
          ). Items are addressed by a required, customer-owned{' '}
          <code>itemId</code> instead of an optional service-generated{' '}
          <code>id</code>.
        </p>
      </RecommendedApiNotice>

      <Divider />

      <Container fluid>
        <p>
          The scenario shows how to add an item to the favorites of the user, or
          update it if it is already a favorite. The catalog entity ID is used
          as <code>itemId</code>, so no preliminary read is needed.
        </p>
        <p>
          Upsert the same entity again with a changed title to update it. An
          insert returns <code>insertedCount: 1</code>, an update returns{' '}
          <code>matchedCount: 1</code> and keeps the service-generated{' '}
          <code>id</code>. <code>modifiedCount</code> is database-reported and
          is not a success flag; use <code>acknowledged</code> and the returned{' '}
          <code>item</code>.
        </p>
        <p>
          Sort fields of an existing item are preserved when omitted, removed
          when sent as <code>null</code> and replaced otherwise. Sorting by them
          is shown in <ScenarioLink shortId="array-list-favorites" />.
        </p>
        <p>
          Upserting a favorite that was added with the deprecated{' '}
          <code>setArrayItem</code> migrates it: the <code>itemId</code> is
          stored and legacy duplicates are removed (reported by{' '}
          <code>deletedCount</code>).
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
                search
                selection
                label="Entity (used as itemId)"
                placeholder="Select an Entity Type: Title"
                options={entityArray.map((entity) => ({
                  text: `${entity.type}: ${entity.title}`,
                  value: entity.id,
                }))}
                value={selectedEntityId}
                onChange={(event, { value }) => selectEntity(value as string)}
              />

              <Form.Input
                label="Title (stored in value)"
                value={title}
                onChange={(event, { value }) => setTitle(value)}
                disabled={selectedEntityId === ''}
              />

              <SortFieldInput
                label="sortString"
                placeholder="Example Movie"
                field={sortString}
                onChange={setSortString}
              />
              <SortFieldInput
                label="sortNumber"
                placeholder="100"
                inputType="number"
                field={sortNumber}
                onChange={setSortNumber}
              />
              <SortFieldInput
                label="sortDate"
                placeholder="2026-09-18T10:30:00Z"
                field={sortDate}
                onChange={setSortDate}
              />

              <Form.Button
                primary
                onClick={async () => {
                  upsertFavorite();
                }}
                disabled={selectedEntityId === ''}
              >
                Upsert Favorite
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>

      {upsertResult !== undefined && (
        <>
          <Divider />
          <Header size="small">
            Upserted Favorite
            <Label>insertedCount: {upsertResult.insertedCount}</Label>
            <Label>matchedCount: {upsertResult.matchedCount}</Label>
            <Label>modifiedCount: {upsertResult.modifiedCount}</Label>
            <Label>deletedCount: {upsertResult.deletedCount}</Label>
          </Header>
          <ArrayItemsTable items={[upsertResult.item]} />
        </>
      )}
    </Segment>
  );
};
