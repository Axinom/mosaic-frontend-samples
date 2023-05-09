import React, { useState, useRef, useEffect, useContext } from 'react';
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

const SharedState = React.createContext(false);

export default SharedState;

export const ProgressSet: React.FC = () => {
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [frequencyOfProgressSaving, setFrequencyOfProgressSaving] =
    useState<number>();
  const [key, setKey] = useState<string>();
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const setProgress = async (isRunning: boolean): Promise<void> => {
    setIsRunning(!isRunning);
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">Progress: Set</Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>personalization-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            The scenario demonstrates how to save the past time on the timer for
            the specified key (could be any identifier, like movieID, episodeID,
            etc).
          </p>
          <p>
            In a real-life scenario, this feature could be utilized to save and
            remember the last viewed position (aka progress) of a video during
            playback.
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
                type="number"
                control={VariableSearch}
                label="Frequency of progress saving (ms)"
                value={frequencyOfProgressSaving}
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

              <Button
                toggle
                active={!isRunning}
                onClick={async () => {
                  setProgress(isRunning);
                }}
                disabled={!frequencyOfProgressSaving}
              >
                {isRunning === false ? 'Run' : 'Pause'}
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
              <SharedState.Provider value={isRunning}>
                <Stopwatch
                  parentKey={key}
                  parentUserAccessToken={userAccessToken}
                  parentFrequencyOfProgressSaving={frequencyOfProgressSaving}
                />
              </SharedState.Provider>
            </div>
          </Grid.Column>
        </Grid>
      </Segment>
    </>
  );
};

interface StopwatchProps {
  parentKey: string | undefined;
  parentUserAccessToken: string | undefined;
  parentFrequencyOfProgressSaving: number | undefined;
}

export const Stopwatch: React.FC<StopwatchProps> = (props) => {
  const { activeProfile, logger } = useScenarioHost();

  const [time, setTime] = useState(0);
  const timeRef = useRef(time);

  const isRunning = useContext(SharedState);

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
  );

  let intervalMutationCall: ReturnType<typeof setInterval> | undefined;

  // 'callMutationWithInterval' and 'intervalMutationCall' will not add to dependency array, because it create the infinite loop.
  useEffect(() => {
    let intervalStopWatch: ReturnType<typeof setInterval> | undefined;
    if (isRunning === true) {
      intervalStopWatch = setInterval(async () => {
        setTime((currentTime) => {
          const newTime = currentTime + 1000;
          timeRef.current = newTime;

          return newTime;
        });
      }, 1000);

      callMutationWithInterval();
    } else {
      if (time !== 0) {
        callMutationWithPauseButtonClick();
      }

      clearInterval(intervalMutationCall);
    }

    return () => {
      clearInterval(intervalStopWatch);
      clearInterval(intervalMutationCall);
    };
  }, [isRunning]);

  const callMutationWithInterval = async (): Promise<void> => {
    intervalMutationCall = setInterval(async () => {
      // Call mutation
      try {
        const result = await apolloClient.mutate({
          mutation: SetProgressMutation,
          variables: {
            input: {
              key: props.parentKey,
              scope: 'PROFILE',
              value: timeRef.current,
            },
          },
          context: {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${props.parentUserAccessToken}`,
            },
          },
          fetchPolicy: 'no-cache',
        });

        logger.log(`method [setProgress]`, 'output:', result.data);

        if (result.errors) {
          logger.error(result.errors);
        }
      } catch (error) {
        if ((error as any).networkError.result.errors[0]) {
          logger.error(
            `method [setProgress]`,
            'output:',
            (error as any).networkError.result.errors[0].message,
          );
        } else if (error instanceof Error) {
          logger.error(`method [setProgress]`, 'output:', error.message);
        }
      }
    }, props.parentFrequencyOfProgressSaving);
  };

  const callMutationWithPauseButtonClick = async (): Promise<void> => {
    // Call mutation
    try {
      const result = await apolloClient.mutate({
        mutation: SetProgressMutation,
        variables: {
          input: {
            key: props.parentKey,
            scope: 'PROFILE',
            value: timeRef.current,
          },
        },
        context: {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${props.parentUserAccessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      logger.log(`method [setProgress]`, 'output:', result.data);

      if (result.errors) {
        logger.error(result.errors);
      }
    } catch (error) {
      if ((error as any).networkError.result.errors[0]) {
        logger.error(
          `method [setProgress]`,
          'output:',
          (error as any).networkError.result.errors[0].message,
        );
      } else if (error instanceof Error) {
        logger.error(`method [setProgress]`, 'output:', error.message);
      }
    }
  };

  return (
    <div className="stopwatch">
      <div className="numbers">
        <span>{('0' + Math.floor((time / 3600000) % 60)).slice(-2)}:</span>
        <span>{('0' + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
        <span>{('0' + Math.floor((time / 1000) % 60)).slice(-2)}</span>
      </div>
      <div className="buttons">
        <button onClick={() => setTime(0)}>Reset</button>
      </div>
    </div>
  );
};
