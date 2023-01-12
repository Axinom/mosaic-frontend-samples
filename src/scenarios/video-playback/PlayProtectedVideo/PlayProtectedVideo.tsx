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
import {
  getEntitlementMessageQuery,
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

export const PlayProtectedVideo: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [entityId, setEntityId] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string>();
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [mockClientIp, setMockClientIp] = useState<string>();

  const [drmLicenseServers, setDrmLicenseServers] = useState([
    'https://drm-widevine-licensing.axtest.net/AcquireLicense',
    'https://drm-widevine-licensing.axprod.net/AcquireLicense',
    'https://drm-playready-licensing.axtest.net/AcquireLicense',
    'https://drm-playready-licensing.axprod.net/AcquireLicense',
  ]);
  const [currentDrmLicenseServer, setCurrentDrmLicenseServer] = useState(
    drmLicenseServers[0],
  );

  const [keySystems, setKeySystems] = useState([
    'com.widevine.alpha',
    'com.microsoft.playready',
  ]);
  const [currentKeySystem, setCurrentKeySystem] = useState(keySystems[0]);
  const [entitlementMessageJwt, setEntitlementMessageJwt] = useState();

  // TODO: Define types for ShakaPlayer or use a different player.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shakaController = useRef<any>();

  const resetVideoPlayback = async (): Promise<void> => {
    const { player } = shakaController.current;
    await player.unload();
  };

  const getEntitlementMessage = async (): Promise<void> => {
    await resetVideoPlayback();

    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.entitlementServiceBaseURL).href,
      );

      const result = await apolloClient.query({
        query: getEntitlementMessageQuery,
        variables: {
          input: {
            entityId,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
            ...(mockClientIp !== undefined && {
              'mosaic-testing-ip': mockClientIp,
            }),
          },
        },
        fetchPolicy: 'no-cache',
      });

      if (result.errors) {
        logger.error(
          'calling [getEntitlementMessage]',
          'output:',
          result.errors,
        );
      } else {
        const entitlementMessageJwt =
          result.data.entitlement.entitlementMessageJwt;

        if (entitlementMessageJwt) {
          setEntitlementMessageJwt(entitlementMessageJwt);
        }

        logger.log(
          'calling [getEntitlementMessage]',
          'output:',
          result.data,
          'Entitlement message (decoded):',
          entitlementMessageJwt
            ? JSON.parse(atob(entitlementMessageJwt.split('.')[1]))
            : 'Entitlement JWT is missing.',
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          'calling [getEntitlementMessage]',
          'output:',
          error.message,
        );
      }
    }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.addEventListener('error', (event: { detail: any }) =>
          logger.error(
            'An error occurred while attempting to play the video.',
            'Please refer the error code displayed below in Shaka Player error documentation at: https://shaka-player-demo.appspot.com/docs/api/shaka.util.Error.html',
            event.detail,
          ),
        );

        // Configure DRM license server.
        player.configure({
          drm: {
            servers: {
              [currentKeySystem]: currentDrmLicenseServer,
            },
          },
        });

        // Add "X-AxDRM-Message" header containing the entitlement JWT to all license requests.
        player
          .getNetworkingEngine()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .registerRequestFilter((type: any, request: any) => {
            if (type === 2) {
              request.headers['X-AxDRM-Message'] = entitlementMessageJwt;
            }
          });

        try {
          await player.load(
            currentVideo.dashManifest ?? currentVideo.hlsManifest,
          );
          videoElement.play();
          logger.log(`Playing video: ${currentVideo.title}`);
        } catch (error) {
          logger.error('An error occurred while attempting to play the video.');
        }
      }
    } else {
      logger.error('Please select a video to play.');
    }
  };

  const setKeySystemForLicenseService = (
    drmLicenseServiceUrl: string,
  ): void => {
    // Find a matching key system for the DRM license service
    let keySystemMatch: string | undefined;
    if (drmLicenseServiceUrl.includes('widevine')) {
      keySystemMatch = keySystems.find((keySystem) =>
        keySystem.includes('widevine'),
      );
    } else if (drmLicenseServiceUrl.includes('playready')) {
      keySystemMatch = keySystems.find((keySystem) =>
        keySystem.includes('playready'),
      );
    }

    if (keySystemMatch !== undefined) {
      setCurrentKeySystem(keySystemMatch);
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Play Protected Video</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>billing-service & monetization-service</Label>
        <Label>catalog-service</Label>
        <Label>entitlement-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>This scenario demonstrates how to play a DRM protected video.</p>

        <p>
          The scenario execution is split into three stages. In the first stage,
          you can enter an <b>Entity ID</b> and retrieve the videos associated
          with it. The videos will be populated under the <b>Video</b> dropdown.
          Generally, protected videos will contain an{' '}
          <b>&apos;isProtected&apos;</b> flag in the query results from the
          Catalog Service.
        </p>

        <p>
          In the second stage, you can generate an entitlement message for the
          selected <b>Entity ID</b>. Generating an entitlement message is an
          authenticated request, and therefore would require an{' '}
          <b>User Access Token</b>. Optionally, you may provide a{' '}
          <b>Mock Client IP</b> to simulate the request originating from
          different origins as it may affect the entitlement message generation.
        </p>

        <p>
          In the third stage, you can find the inputs which can be used to
          playback the video. You can choose a video from the <b>Videos</b>{' '}
          dropdown (pre-populated from first stage). Then you can choose the
          appropriate <b>DRM License Service URL</b> from the drop-down based on
          the combination of <b>Key Server</b> (i.e. axtest, axprod) and{' '}
          <b>DRM Solution</b> (i.e. Widevine, PlayReady). The value for{' '}
          <b>Key System</b> will be derived based on the selected URL. It is
          also possible to type-in a custom <b>DRM License Service URL</b> and a{' '}
          <b>Key System</b> if required.
        </p>

        <p>
          Clicking on the <b>[Play Video]</b> button will load the ShakaPlayer
          with the provided inputs and attempt to play the video.
        </p>
      </Container>

      <Divider />

      <Grid divided>
        <Grid.Column mobile={16} tablet={8} computer={4}>
          <Form>
            <Form.Input
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

            <Form.Input
              control={VariableSearch}
              icon="id card outline"
              label="Entity ID"
              value={entityId}
              setStateValue={setEntityId}
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
              icon="id card outline"
              label="Mock Client IP"
              value={mockClientIp}
              setStateValue={setMockClientIp}
            />

            <Form.Button
              primary
              onClick={async () => {
                getEntitlementMessage();
              }}
            >
              Get Entitlement Message
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
              onChange={(event, { value }) => {
                setCurrentVideoId(value as string);
              }}
            ></Form.Dropdown>

            <Form.Dropdown
              search
              selection
              fluid
              allowAdditions
              label="DRM License Service URL"
              placeholder="Select a DRM License Service URL"
              additionLabel="Custom DRM License Service URL: "
              options={drmLicenseServers.map((serverUrl) => {
                return { text: serverUrl, value: serverUrl };
              })}
              value={currentDrmLicenseServer}
              onAddItem={(event, { value }) => {
                setDrmLicenseServers((prev) => [value as string, ...prev]);
              }}
              onChange={(event, { value }) => {
                const drmLicenseServer = value as string;
                setCurrentDrmLicenseServer(drmLicenseServer);
                setKeySystemForLicenseService(drmLicenseServer);
              }}
            ></Form.Dropdown>

            <Form.Dropdown
              search
              selection
              fluid
              allowAdditions
              label="Key System"
              placeholder="Select a Key System"
              additionLabel="Custom Key System: "
              options={keySystems.map((keySystem) => {
                return { text: keySystem, value: keySystem };
              })}
              value={currentKeySystem}
              onAddItem={(event, { value }) => {
                setKeySystems((prev) => [value as string, ...prev]);
              }}
              onChange={(event, { value }) => {
                setCurrentKeySystem(value as string);
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
        <Grid.Column mobile={16} tablet={8} computer={12}>
          <ShakaPlayer ref={shakaController} />
        </Grid.Column>
      </Grid>
    </Segment>
  );
};
