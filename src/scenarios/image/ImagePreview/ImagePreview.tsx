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
import { getApolloClient } from '../../../apollo-client';
import {
  getEpisodeImagesQuery,
  getMovieImagesQuery,
  getSeasonImagesQuery,
  getTvShowImagesQuery,
} from './graphql-documents';

interface Image {
  id: string;
  width: number;
  height: number;
  path: string;
  type: string;
}

export const ImagePreview: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [entityId, setEntityId] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [currentImageId, setCurrentImageId] = useState<string>();
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [path, setPath] = useState<string>('');

  const getImageUrl = async (): Promise<void> => {
    const imageUrl = `${activeProfile.imageServiceBaseURL}${path}?w=${width}&h=${height}`;

    logger.log('calling [getImageUrl]', 'output:', imageUrl);
  };

  const fetchImagesForEntityId = async (): Promise<void> => {
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

        logger.log('calling [fetchImagesForEntityId]', 'output:', result.data);

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
            'calling [fetchImagesForEntityId]',
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

  const getValueWithDefault = (value: string, defaultValue: string): string => {
    return value === '' ? defaultValue : value;
  };

  const setCurrentImageData = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps,
  ): void => {
    const imageId = data.value as string;
    setCurrentImageId(imageId);

    const selectedImage = images.find((image) => image.id === imageId);
    setWidth(selectedImage?.width ?? 0);
    setHeight(selectedImage?.height ?? 0);
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
        <p>
          This scenario demonstrates how to query the Mosaic Image Service. It
          uses the Catalog Service first to retrieve the published image(s)
          for a given entity. Then it will allow you to fine-tune the width &
          height properties and get the URL that shall be queried from the Image
          Service to retrieve the transformed image. The focal-point defined for
          the image in the Management System will be already applied.
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
                  fetchImagesForEntityId();
                }}
                disabled={entityId === ''}
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
                icon="id card outline"
                label="Width"
                type="number"
                placeholder="Width"
                value={width}
                onChange={(event) => {
                  setWidth(
                    parseInt(getValueWithDefault(event.target.value, '0')),
                  );
                }}
              />

              <Form.Input
                icon="id card outline"
                label="Height"
                type="number"
                placeholder="Height"
                value={height}
                onChange={(event) => {
                  setHeight(
                    parseInt(getValueWithDefault(event.target.value, '0')),
                  );
                }}
              />

              <Form.Button
                primary
                onClick={async () => {
                  getImageUrl();
                }}
                disabled={!path && !width && !height}
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
