import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  forwardRef,
  useImperativeHandle,
} from 'react';
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

interface CurrentTimeHandle {
  getCurrentTime: () => number;
}

export const ProgressSet: React.FC = () => {
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [frequencyOfProgressSaving, setFrequencyOfProgressSaving] =
    useState<number>();
  const [key, setKey] = useState<string>();
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { activeProfile, logger } = useScenarioHost();

  let intervalMutationCall: ReturnType<typeof setInterval> | undefined;

  // Reference to the stopwatch component. This can be used to get stopwatch current time.
  const currentTimeRef = useRef<CurrentTimeHandle>(null);

  useEffect(() => {
    (async () => {
      if (isRunning === true) {
        await callSetProgressMutationWithInterval();
      } else {
        if (currentTimeRef.current?.getCurrentTime() !== 0) {
          await callSetProgressMutation();
        }
      }
    })();

    return () => {
      clearInterval(intervalMutationCall);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const apolloClient = getApolloClient(
    new URL('graphql', activeProfile.personalizationServiceBaseURL).href,
  );

  const callSetProgressMutation = async (): Promise<void> => {
    try {
      const result = await apolloClient.mutate({
        mutation: SetProgressMutation,
        variables: {
          input: {
            key: key,
            scope: 'PROFILE',
            value: currentTimeRef.current?.getCurrentTime(),
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

      logger.log(
        `method [${callSetProgressMutation.name}]`,
        'output:',
        result.data,
      );

      if (result.errors) {
        logger.error(result.errors);
      }
    } catch (error) {
      if ((error as any).networkError.result.errors[0]) {
        logger.error(
          `method [${callSetProgressMutation.name}]`,
          'output:',
          (error as any).networkError.result.errors[0].message,
        );
      } else if (error instanceof Error) {
        logger.error(
          `method [${callSetProgressMutation.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  const callSetProgressMutationWithInterval = async (): Promise<void> => {
    intervalMutationCall = setInterval(async () => {
      return callSetProgressMutation();
    }, frequencyOfProgressSaving);
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
                control={VariableSearch}
                icon="key"
                label="User Access Token"
                value={userAccessToken}
                setStateValue={setUserAccessToken}
              />

              <Form.Input
                type="number"
                control={VariableSearch}
                label="Frequency of progress saving (ms)"
                value={frequencyOfProgressSaving}
                setStateValue={setFrequencyOfProgressSaving}
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
                  setIsRunning((prevIsRunning) => !prevIsRunning);
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
                <Stopwatch ref={currentTimeRef} />
              </SharedState.Provider>
            </div>
          </Grid.Column>
        </Grid>
      </Segment>
    </>
  );
};

// eslint-disable-next-line react/display-name, @typescript-eslint/no-unused-vars
const Stopwatch = forwardRef<CurrentTimeHandle>((props, ref) => {
  const [time, setTime] = useState(0);
  const timeRef = useRef(time);
  const isRunning = useContext(SharedState);

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
    }

    return () => {
      clearInterval(intervalStopWatch);
    };
  }, [isRunning]);

  //This function can be accessed via a ref.
  useImperativeHandle(ref, () => ({
    getCurrentTime() {
      return timeRef.current;
    },
  }));

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
});
