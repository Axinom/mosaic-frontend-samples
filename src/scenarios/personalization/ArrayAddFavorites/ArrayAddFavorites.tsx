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
  getMoviesQuery,
  getTvShowsQuery,
  setArrayItemMutation,
} from './graphql-documents';

interface entity {
  id: string;
  title: string;
  type: string;
}

export const ArrayAddFavorites: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const [entityArray, setEntityArray] = useState<entity[]>([]);
  const [entityId, setSelectedEntity] = useState<string>('');

  const fetchAllCatalogItems = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.catalogServiceBaseURL).href,
      );

      const resultMovies = await apolloClient.query({
        query: getMoviesQuery,
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      const resultTvShows = await apolloClient.query({
        query: getTvShowsQuery,
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      const moviesArray = resultMovies.data.movies.nodes;
      const tvShowsArray = resultTvShows.data.tvshows.nodes;

      // Add Entity Type
      for (let i = 0; i < moviesArray.length; i++) {
        moviesArray[i] = Object.assign(moviesArray[i], {
          type: 'Movie',
        });
      }

      for (let i = 0; i < tvShowsArray.length; i++) {
        tvShowsArray[i] = Object.assign(tvShowsArray[i], {
          type: 'TV Show',
        });
      }

      // Concat Entity Arrays
      const result = moviesArray.concat(tvShowsArray);
      setEntityArray(result);

      logger.log(`calling [${fetchAllCatalogItems.name}]`, 'output:', result);

      if (result.errors) {
        logger.error(result.errors);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `calling [${fetchAllCatalogItems.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  const addToFavorites = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
      );

      const index = entityId.indexOf(':'); // Gets the first index where a colon occurs.
      const id = entityId.substring(0, index); // Gets the id part
      const title = entityId.substring(index + 1); // Gets the title part

      interface EntityObject {
        id: string;
        title: string;
      }

      const entityObject: EntityObject = {
        id: id,
        title: title,
      };

      const result = await apolloClient.mutate({
        mutation: setArrayItemMutation,
        variables: {
          input: {
            scope: 'PROFILE',
            key: 'user_profile:favorites',
            value: entityObject,
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
                    value: `${entity.id}: ${entity.title}`,
                  };
                })}
                value={entityId}
                onChange={(event, { value }) => {
                  setSelectedEntity(value as string);
                }}
              ></Form.Dropdown>

              <Form.Button
                primary
                onClick={async () => {
                  addToFavorites();
                }}
                disabled={entityId === ''}
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
