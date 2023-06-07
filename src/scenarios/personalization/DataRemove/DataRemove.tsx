import React, { useState } from 'react';
import {
  Button,
  Container,
  Divider,
  Form,
  Grid,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { getApolloClient } from '../../../apollo-client';
import { deleteKeyMutation } from './graphql-documents';

export const DataRemove: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [selectedScope, setSelectedScope] = useState<string>('');
  const [key, setKey] = useState<string>('');

  const scopeArr = [
    {
      label: 'User',
      value: 'USER',
    },
    {
      label: 'Profile',
      value: 'PROFILE',
    },
  ];

  const removeSelectedKey = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
      );

      const result = await apolloClient.mutate({
        mutation: deleteKeyMutation,
        variables: {
          input: {
            scope: selectedScope,
            key: key,
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
          `method [${removeSelectedKey.name}]`,
          'output:',
          result.errors,
        );
      } else {
        logger.log(
          `method [${removeSelectedKey.name}]`,
          'output:',
          result.data,
        );
      }
    } catch (error) {
      if ((error as any).networkError.result.errors[0]) {
        logger.error(
          `method [${removeSelectedKey.name}]`,
          'output:',
          (error as any).networkError.result.errors[0].message,
        );
      } else if (error instanceof Error) {
        logger.error(
          `method [${removeSelectedKey.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">Data: Remove</Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>personalization-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            The scenario demonstrates how the data associated with the user can
            be removed by the key and scope of the earlier saved key-value pair.
          </p>
          <p>
            If the user is not already signed-in, you can use one of the Sign-In
            scenarios.
          </p>
        </Container>

        <Divider />

        <Grid divided>
          <Grid.Column width={5}>
            <Form>
              <Form.Input
                control={VariableSearch}
                icon="key"
                label="User Access Token"
                value={userAccessToken}
                setStateValue={setUserAccessToken}
              />

              <Form.Dropdown
                clearable
                search
                fluid
                selection
                label="Scope"
                placeholder="Select Scope"
                options={scopeArr.map((scope) => {
                  return {
                    text: `${scope.label}`,
                    value: scope.value,
                  };
                })}
                value={selectedScope}
                onChange={(event, { value }) => {
                  setSelectedScope(value as string);
                }}
              ></Form.Dropdown>

              <Form.Input
                label="Key"
                placeholder="Type in the key name"
                type="text"
                value={key}
                onChange={(event) => {
                  setKey(event.target.value);
                }}
              />

              <Button
                primary
                onClick={async () => {
                  removeSelectedKey();
                }}
              >
                Remove Selected Key
              </Button>
            </Form>
          </Grid.Column>
        </Grid>
      </Segment>
    </>
  );
};
