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
import { getArrayQuery } from './graphql-documents';

export const ArrayGetFavorites: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();

  const fetchFavorites = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
      );

      const result = await apolloClient.mutate({
        mutation: getArrayQuery,
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

      if (result.errors) {
        logger.error(
          `method [${fetchFavorites.name}]`,
          'output:',
          result.errors,
        );
      } else {
        logger.log(`method [${fetchFavorites.name}]`, 'output:', result.data);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `method [${fetchFavorites.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Array: Get Favorite(s)</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>personalization-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>
          The scenario shows an example on how to retrieve favorite items of the
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
                  fetchFavorites();
                }}
              >
                Fetch Favorites
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};
