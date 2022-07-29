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
    }
  }
`;
