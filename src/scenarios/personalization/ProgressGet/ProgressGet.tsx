import { useState } from 'react';
import {
  Button,
  Container,
  Divider,
  Form,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { getApolloClient } from '../../../apollo-client';
import { getProgressQuery } from './graphql-documents';

export const ProgressGet: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [key, setKey] = useState<string>();

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
  );

  const getProgressValue = async (): Promise<void> => {
    try {
      const result = await apolloClient.query({
        query: getProgressQuery,
        variables: {
          getProgressInput: {
            keys: [key],
            scope: 'PROFILE',
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      logger.log(`method [${getProgressValue.name}]`, 'output:', result.data);

      if (result.errors) {
        logger.error(result.errors);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `method [${getProgressValue.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">Progress</Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>personalization-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates the main use case for saving the
            user&apos;s progress of the video playback.
          </p>

          <p>
            If the user is not already signed-in, you can use one of the Sign-In
            scenarios.
          </p>
        </Container>

        <Divider />

        <Form>
          <Form.Input
            control={VariableSearch}
            width={4}
            icon="key"
            label="User Access Token"
            value={userAccessToken}
            setStateValue={setUserAccessToken}
          />

          <Form.Input
            control={VariableSearch}
            width={4}
            label="Key"
            value={key}
            setStateValue={setKey}
          />

          <Button
            primary
            onClick={async () => {
              getProgressValue();
            }}
          >
            Get Progress Value
          </Button>
        </Form>
      </Segment>
    </>
  );
};
