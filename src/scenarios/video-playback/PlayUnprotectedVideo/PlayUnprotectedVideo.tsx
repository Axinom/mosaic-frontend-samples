/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { DocumentNode } from 'graphql';
import { useRef, useState } from 'react';
import {
  Container,
  Divider,
  Form,
  Grid,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import ShakaPlayer from 'shaka-player-react';
import 'shaka-player-react/dist/controls.css';
import { getApolloClient } from '../../../apollo-client';
import { ScenarioKey } from '../../../scenario-registry';
import {
  getEpisodeVideosQuery,
  getMovieVideosQuery,
  getSeasonVideosQuery,
  getTvShowVideosQuery,
} from './graphql-documents';

interface Video {
  id: string;
  title: string;
  type: string;
  dashManifest: string;
  hlsManifest: string;
}

const SCENARIO_KEY_PLAY_PROTECTED_VIDEO: ScenarioKey = 'play-protected-video';

export const PlayUnprotectedVideo: React.FC = () => {
  const { scenarios, activeProfile, logger } = useScenarioHost();
  const [entityId, setEntityId] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string>();

  // TODO: Define types for ShakaPlayer or use a different player.
  const shakaController = useRef<any>();

  const resetVideoPlayback = async (): Promise<void> => {
    const { player } = shakaController.current;
    await player.unload();
  };

  const fetchVideosForEntityId = async (): Promise<void> => {
    await resetVideoPlayback();

    let query: DocumentNode | undefined = undefined;
    if (entityId.startsWith('movie-')) {
      query = getMovieVideosQuery;
    } else if (entityId.startsWith('tvshow-')) {
      query = getTvShowVideosQuery;
    } else if (entityId.startsWith('season-')) {
      query = getSeasonVideosQuery;
    } else if (entityId.startsWith('episode-')) {
      query = getEpisodeVideosQuery;
    }

    if (query !== undefined) {
      try {
        const apolloClient = getApolloClient(
          new URL('graphql', activeProfile.catalogServiceBaseURL).href,
        );

        const result = await apolloClient.query({
          query,
          variables: {
            id: entityId,
          },
          fetchPolicy: 'no-cache',
        });

        logger.log('calling [fetchVideosForEntityId]', 'output:', result.data);

        if (result.errors) {
          logger.error(result.errors);
        } else {
          const mediaEntity = result.data[Object.keys(result.data)[0]];
          if (mediaEntity !== null) {
            setVideos(mediaEntity.videos.nodes);
          } else {
            setVideos([]);
            logger.error('Invalid entity ID.');
          }
        }
      } catch (error) {
        setVideos([]);
        if (error instanceof Error) {
          logger.error(
            'calling [fetchVideosForEntityId]',
            'output:',
            error.message,
          );
        }
      }
    } else {
      setVideos([]);
      logger.error('Invalid entity ID.');
    }
  };

  const playVideo = async (): Promise<void> => {
    await resetVideoPlayback();

    if (currentVideoId !== undefined) {
      const currentVideo = videos.find((video) => video.id === currentVideoId);
      if (currentVideo !== undefined) {
        const { player, videoElement } = shakaController.current;

        // Listen for error events.
        // TODO: this should be done only once instead on every time 'Play Video' button is pressed.
        player.addEventListener('error', (event: { detail: any }) =>
          logger.error(
            'An error occurred while attempting to play the video.',
            'Please refer the error code displayed below in Shaka Player error documentation at: https://shaka-player-demo.appspot.com/docs/api/shaka.util.Error.html',
            event.detail,
          ),
        );

        try {
          await player.load(
            currentVideo.dashManifest ?? videoElement.hlsManifest,
          );
          videoElement.play();
          logger.log(`Playing video: ${currentVideo.title}`);
        } catch (error) {
          const playProtectedVideoScenario = scenarios.find(
            (scenario) =>
              scenario.shortId === SCENARIO_KEY_PLAY_PROTECTED_VIDEO,
          );

          logger.error(
            'An error occurred while attempting to play the video.',
            `If this is a protected video, please use "${playProtectedVideoScenario?.displayName}" scenario instead.`,
          );
        }
      }
    } else {
      logger.error('Please select a video to play.');
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Play Unprotected Video</Header>
      <Header size="small">
        Required Services:
        <Label>catalog-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>
          This scenario demonstrates how to play a video that is not DRM
          protected.
        </p>
        <p>
          The scenario execution is split into two stages. In the first stage,
          you can enter an <b>Entity ID</b> and click on{' '}
          <b>[Fetch Videos for Entity ID]</b> button. This will populate the{' '}
          <b>Video</b> dropdown with a list of videos that are associated with
          that media entity.
        </p>
        <p>
          You can then select a video from the dropdown and click on{' '}
          <b>[Play Video]</b> button to play the selected video.
        </p>
      </Container>

      <Divider />

      <Grid divided>
        <Grid.Column width={4}>
          <Form>
            <Form.Input
              fluid
              control={VariableSearch}
              icon="id card outline"
              label="Entity ID"
              value={entityId}
              setStateValue={setEntityId}
            />

            <Form.Button
              primary
              onClick={async () => {
                fetchVideosForEntityId();
              }}
            >
              Fetch Videos for Entity ID
            </Form.Button>

            <Divider />

            <Form.Dropdown
              fluid
              selection
              label="Video"
              placeholder="Select a video to play"
              options={videos.map((video) => {
                return {
                  text: `${video.title} (${video.type.toLocaleLowerCase()})`,
                  value: video.id,
                };
              })}
              value={currentVideoId}
              onChange={(event, { _options, value }) => {
                setCurrentVideoId(value as string);
              }}
            ></Form.Dropdown>

            <Form.Button
              primary
              onClick={async () => {
                playVideo();
              }}
            >
              Play Video
            </Form.Button>
          </Form>
        </Grid.Column>
        <Grid.Column width={12}>
          <ShakaPlayer ref={shakaController} />
        </Grid.Column>
      </Grid>
    </Segment>
  );
};
