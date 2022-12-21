import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { DocumentNode } from 'graphql';
import { useState } from 'react';
import {
  Container,
  Divider,
  DropdownProps,
  Form,
  Grid,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import 'shaka-player-react/dist/controls.css';
import { getApolloClient } from '../../../apollo-client';
import {
  getEpisodeImagesQuery,
  getMovieImagesQuery,
  getSeasonImagesQuery,
  getTvShowImagesQuery,
} from './graphql-documents';

interface Image {
  id: string;
  width: string;
  height: string;
  path: string;
  type: string;
}

export const ImagePreview: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [entityId, setEntityId] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [currentImageId, setCurrentImageId] = useState<string>();
  const [width, setWidth] = useState<string>();
  const [height, setHeight] = useState<string>();
  const [path, setPath] = useState<string>();

  const getImageUrl = async (): Promise<void> => {
    const imageUrl = `${activeProfile.imageServiceBaseURL}${path}`;

    logger.log('calling [getImageUrl]', 'output:', imageUrl);
  };

  const fetchImageForEntityId = async (): Promise<void> => {
    let query: DocumentNode | undefined = undefined;

    if (entityId.startsWith('movie-')) {
      query = getMovieImagesQuery;
    } else if (entityId.startsWith('tvshow-')) {
      query = getTvShowImagesQuery;
    } else if (entityId.startsWith('season-')) {
      query = getSeasonImagesQuery;
    } else if (entityId.startsWith('episode-')) {
      query = getEpisodeImagesQuery;
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

        logger.log('calling [fetchImageForEntityId]', 'output:', result.data);

        if (result.errors) {
          logger.error(result.errors);
        } else {
          const mediaEntity = result.data[Object.keys(result.data)[0]];
          if (mediaEntity !== null) {
            setImages(mediaEntity.images.nodes);
          } else {
            setImages([]);
            logger.error('Invalid entity ID.');
          }
        }
      } catch (error) {
        setImages([]);
        if (error instanceof Error) {
          logger.error(
            'calling [fetchImageForEntityId]',
            'output:',
            error.message,
          );
        }
      }
    } else {
      setImages([]);
      logger.error('Invalid entity ID.');
    }
  };

  const setCurrentImageData = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps,
  ): void => {
    const imageId = data.value as string;
    setCurrentImageId(imageId);

    const selectedImage = images.find((image) => image.id === imageId);
    setWidth(selectedImage?.width ?? '');
    setHeight(selectedImage?.height ?? '');
    setPath(selectedImage?.path ?? '');
  };

  return (
    <Segment basic>
      <Header size="huge">Image Preview</Header>
      <Header size="small">
        Required Services:
        <Label>catalog-service</Label>
        <Label>image-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>This scenario execution is split in to two steps.</p>

        <p>
          In the first step, you can enter an Entity ID and retrieve the images
          associated with it. The images will be populated under the Image
          dropdown.
        </p>

        <p>
          In the second stage, you can find the inputs which can be used to
          transform the image selected from the dropdown (pre-populated from
          first step).
        </p>

        <p>
          As a result, an URL with the transformed image will be logged(the
          focal point defined in Management System will be already applied)
        </p>
      </Container>

      <Divider />

      <Grid divided>
        <Grid.Column width={8}>
          <Segment basic>
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
                  fetchImageForEntityId();
                }}
              >
                Fetch Images for Entity ID
              </Form.Button>

              <Divider />

              <Form.Dropdown
                fluid
                selection
                label="Image"
                placeholder="Select Image"
                options={images.map((image) => {
                  return {
                    text: `${image.path
                      .split('/')
                      .pop()} (${image.type.toLocaleLowerCase()})`,
                    value: image.id,
                  };
                })}
                value={currentImageId}
                onChange={setCurrentImageData}
              ></Form.Dropdown>

              <Form.Input
                control={VariableSearch}
                icon="id card outline"
                label="Width"
                placeholder="Width"
                value={width}
                setStateValue={setWidth}
              />

              <Form.Input
                control={VariableSearch}
                icon="id card outline"
                label="Height"
                placeholder="Height"
                value={height}
                setStateValue={setHeight}
              />

              <Form.Button
                primary
                onClick={async () => {
                  getImageUrl();
                }}
              >
                Get Image URL
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};
