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
import {
  getArrayQuery,
  getCatalogItemsQuery,
  setArrayItemMutation,
} from './graphql-documents';

interface Entity {
  id: string;
  title: string;
  type: 'Movie' | 'TV Show';
}

interface Favorite {
  key: string;
  value: string;
  id: string;
}

export const ArrayAddFavorites: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const [entityArray, setEntityArray] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');

  const apolloClientCatalog = getApolloClient(
    new URL('graphql', activeProfile.catalogServiceBaseURL).href,
  );
  const apolloClientPersonalization = getApolloClient(
    new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
  );

  const fetchAllCatalogItems = async (): Promise<void> => {
    try {
      // Get all catalog items
      const resultCatalogItems = await apolloClientCatalog.query({
        query: getCatalogItemsQuery,
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      const moviesArray: Entity[] = resultCatalogItems.data.movies.nodes.map(
        (movie: Entity) => ({ ...movie, type: 'Movie' }),
      );
      const tvShowsArray: Entity[] = resultCatalogItems.data.tvshows.nodes.map(
        (tvShow: Entity) => ({ ...tvShow, type: 'TV Show' }),
      );

      // Concat Entity Arrays
      const catalogItemsArray = moviesArray.concat(tvShowsArray);

      // Get all favorites
      const resultFavorites = await apolloClientPersonalization.query({
        query: getArrayQuery,
        variables: {
          input: {
            scope: 'PROFILE',
            key: 'user_profile:favorites',
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      const resultFiltered = filterExistingItems(
        catalogItemsArray,
        resultFavorites.data.getArray.data as Favorite[],
      );

      setEntityArray(resultFiltered);

      if (resultCatalogItems.errors) {
        logger.error(
          `calling [${fetchAllCatalogItems.name}]`,
          'output:',
          resultCatalogItems.errors,
        );
      } else if (resultFavorites.errors) {
        logger.error(
          `calling [${fetchAllCatalogItems.name}]`,
          'output:',
          resultFavorites.errors,
        );
      } else {
        logger.log(
          `method [${fetchAllCatalogItems.name}]`,
          'output:',
          resultCatalogItems.data,
        );
      }
    } catch (error) {
      if ((error as any).networkError.result.errors[0]) {
        logger.error(
          `method [${fetchAllCatalogItems.name}]`,
          'output:',
          (error as any).networkError.result.errors[0].message,
        );
      } else if (error instanceof Error) {
        logger.error(
          `calling [${fetchAllCatalogItems.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  function filterExistingItems(
    catalogItemsArray: Entity[],
    favoritesArray: Favorite[],
  ): Entity[] {
    const favoriteArrayIds = favoritesArray.map((favorite) => {
      const entityValue: any = favorite?.value;
      return entityValue['id'];
    });

    const filteredArray = catalogItemsArray.filter(
      (item) => !favoriteArrayIds.includes(item.id),
    );

    return filteredArray;
  }

  const addToFavorites = async (): Promise<void> => {
    try {
      const selectedEntityData = entityArray.find(
        (entity) => entity.id === selectedEntityId,
      );

      const result = await apolloClientPersonalization.mutate({
        mutation: setArrayItemMutation,
        variables: {
          input: {
            scope: 'PROFILE',
            key: 'user_profile:favorites',
            value: {
              id: selectedEntityId,
              title: selectedEntityData?.title,
            },
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
          `method [${addToFavorites.name}]`,
          'output:',
          result.errors,
        );
      } else {
        logger.log(`method [${addToFavorites.name}]`, 'output:', result.data);
        logger.log(`Updating entity IDs dropdown after adding favorites.`);
        await fetchAllCatalogItems();
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `method [${addToFavorites.name}]`,
          'output:',
          error.message,
        );
      } else {
        logger.error(
          `method [${addToFavorites.name}]`,
          'output:',
          JSON.stringify(error),
        );
      }
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Array: Add Favorite(s)</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>catalog-service</Label>
        <Label>personalization-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>
          The scenario gives an example on how to mark favorite items of the
          user.
        </p>
        <p>
          In a real-life scenario any kind of list of items that is linked to a
          user&apos;s profile can be managed (eg. favorites, watch history,
          to-do list, etc)
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
                selection
                label="Entity ID"
                placeholder="Select an Entity Type: Title"
                options={entityArray.map((entity) => {
                  return {
                    text: `${entity.type}: ${entity.title}`,
                    value: `${entity.id}`,
                  };
                })}
                value={selectedEntityId}
                onChange={(event, { value }) => {
                  setSelectedEntityId(value as string);
                }}
              ></Form.Dropdown>

              <Form.Button
                primary
                onClick={async () => {
                  addToFavorites();
                }}
                disabled={selectedEntityId === ''}
              >
                Add to Favorites
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};
