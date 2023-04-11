import React, { useState, useRef, useEffect, Component } from 'react';
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
import { SetProgressMutation } from './graphql-documents';

export const ProgressSet: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [FrequencyOfProgressSaving, setFrequencyOfProgressSaving] =
    useState<number>();
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [key, setKey] = useState<string>();
  const [buttonState, setButtonState] = useState<boolean>(true);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (buttonState === false) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (buttonState === true) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [buttonState]);

  const setProgress = async (): Promise<void> => {
    setButtonState(!buttonState);

    if (buttonState === true) {
      callMutationWithIntervale();
    } else if (buttonState === false) {
      clearInterval(intervalId);
    }
  };

  function callMutationWithIntervale(): void {
    const handler = setInterval(async () => {
      // Call mutation
      try {
        const result = await apolloClient.mutate({
          mutation: SetProgressMutation,
          variables: {
            input: {
              key,
              scope: 'PROFILE',
              value: time,
            },
          },
          context: {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userAccessToken}`,
            },
          },
          fetchPolicy: 'no-cache',
        });

        logger.log(`method [${setProgress.name}]`, 'output:', result.data);

        if (result.errors) {
          logger.error(result.errors);
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(
            `method [${setProgress.name}]`,
            'output:',
            error.message,
          );
        }
      }
    }, FrequencyOfProgressSaving);

    setIntervalId(handler);
  }

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
        </Container>

        <Divider />

        <Grid divided>
          <Grid.Column width={5}>
            <Form>
              <Form.Input
                control={VariableSearch}
                label="Frequency of progress saving (ms)"
                value={FrequencyOfProgressSaving}
                setStateValue={setFrequencyOfProgressSaving}
              />

              <Form.Input
                control={VariableSearch}
                icon="key"
                label="User Access Token"
                value={userAccessToken}
                setStateValue={setUserAccessToken}
              />

              <Form.Input
                control={VariableSearch}
                label="Key"
                value={key}
                setStateValue={setKey}
              />

              <Button toggle active={buttonState} onClick={setProgress}>
                {buttonState === true ? 'Run' : 'Pause'}
              </Button>
            </Form>
          </Grid.Column>
          <Grid.Column width={5}>
            <div
              style={{
                fontSize: '16px',
                lineHeight: 2,
                paddingLeft: 100,
                paddingTop: 10,
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              <div className="stopwatch">
                <div className="numbers">
                  <span>
                    {('0' + Math.floor((time / 3600000) % 60)).slice(-2)}:
                  </span>
                  <span>
                    {('0' + Math.floor((time / 60000) % 60)).slice(-2)}:
                  </span>
                  <span>
                    {('0' + Math.floor((time / 1000) % 60)).slice(-2)}:
                  </span>
                  <span>{('0' + ((time / 10) % 100)).slice(-2)}</span>
                </div>
                <div className="buttons">
                  <button onClick={() => setTime(0)}>Reset</button>
                </div>
              </div>
            </div>
          </Grid.Column>
        </Grid>
      </Segment>
    </>
  );
};
