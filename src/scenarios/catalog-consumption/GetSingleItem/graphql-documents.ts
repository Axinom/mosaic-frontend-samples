import gql from 'graphql-tag';

export const getAllItemsQuery = gql`
  query GetAllItems($id: String!) {
    movie(id: $id) {
      id
      title
      synopsis
      genres {
        nodes {
          movieGenre {
            title
          }
        }
      }
      cast
      released
      tags
      images {
        nodes {
          id
          type
          path
        }
      }
      videos {
        nodes {
          id
          dashManifest
          hlsManifest
          cuePoints {
            nodes {
              id
              cuePointTypeKey
              timeInSeconds
              value
            }
          }
        }
      }
    }
    tvshow(id: $id) {
      id
      title
      synopsis
      genres {
        nodes {
          tvshowGenre {
            title
          }
        }
      }
      cast
      released
      tags
      images {
        nodes {
          id
          type
          path
        }
      }
      seasons {
        nodes {
          id
          index
          synopsis
          episodes {
            nodes {
              id
              index
              title
              synopsis
            }
          }
        }
      }
    }
    season(id: $id) {
      id
      index
      synopsis
      genres {
        nodes {
          tvshowGenre {
            title
          }
        }
      }
      cast
      released
      tags
      images {
        nodes {
          id
          type
          path
        }
      }
    }
    episode(id: $id) {
      id
      index
      synopsis
      genres {
        nodes {
          tvshowGenre {
            title
          }
        }
      }
      cast
      released
      tags
      images {
        nodes {
          id
          type
          path
        }
      }
      videos {
        nodes {
          id
          dashManifest
          hlsManifest
          cuePoints {
            nodes {
              id
              cuePointTypeKey
              timeInSeconds
              value
            }
          }
        }
      }
    }
    channel(id: $id) {
      id
      title
      hlsStreamUrl
      description
      dashStreamUrl
    }
  }
`;
