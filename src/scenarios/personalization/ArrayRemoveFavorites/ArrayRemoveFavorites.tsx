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
import { getArrayQuery, deleteArrayItemMutation } from './graphql-documents';

interface Favorite {
  key: string;
  value: string;
  id: string;
}

export const ArrayRemoveFavorites: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const [favoriteArray, setFavoriteArray] = useState<Favorite[]>([]);
  const [entityId, setSelectedEntity] = useState<string>('');

  const fetchFavoritesByAccessToken = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
      );

      const result = await apolloClient.query({
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

      setFavoriteArray(result.data.getArray.data);

      if (result.errors) {
        logger.error(
          `calling [${fetchFavoritesByAccessToken.name}]`,
          'output:',
          result.errors,
        );
      } else {
        logger.log(
          `method [${fetchFavoritesByAccessToken.name}]`,
          'output:',
          result.data,
        );
      }
    } catch (error) {
      if ((error as any).networkError.result.errors[0]) {
        logger.error(
          `method [${fetchFavoritesByAccessToken.name}]`,
          'output:',
          (error as any).networkError.result.errors[0].message,
        );
      } else if (error instanceof Error) {
        logger.error(
          `calling [${fetchFavoritesByAccessToken.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  const removeFromFavorites = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
      );

      const result = await apolloClient.mutate({
        mutation: deleteArrayItemMutation,
        variables: {
          input: {
            scope: 'PROFILE',
            key: 'user_profile:favorites',
            id: entityId,
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
          `method [${removeFromFavorites.name}]`,
          'output:',
          result.errors,
        );
      } else {
        logger.log(
          `method [${removeFromFavorites.name}]`,
          'output:',
          result.data,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `method [${removeFromFavorites.name}]`,
          'output:',
          error.message,
        );
      } else {
        logger.error(
          `method [${removeFromFavorites.name}]`,
          'output:',
          JSON.stringify(error),
        );
      }
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Array: Remove Favorite(s)</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>personalization-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>
          The scenario shows an example on how to remove an item from the list
          of user favorites.
        </p>
        <p>
          In a real-life scenario any kind of list of items that is linked to a
          user&apos;s profile can be managed (eg. favorites, watch history,
          to-do list, etc).
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
                  fetchFavoritesByAccessToken();
                }}
              >
                Fetch Favorites by Access Token
              </Form.Button>

              <Divider />

              <Form.Dropdown
                fluid
                selection
                label="Favorite Entity ID"
                placeholder="Select an Entity ID"
                options={favoriteArray.map((favorite) => {
                  const entityValue: any = favorite?.value;
                  return {
                    text: `${entityValue['title']}`,
                    value: `${favorite.id}`,
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
                  removeFromFavorites();
                }}
                disabled={entityId === ''}
              >
                Remove from Favorites
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};
