import gql from 'graphql-tag';

export const getAllItemsQuery = gql`
  query GetAllItems {
    movies {
      nodes {
        id
        title
        genres {
          nodes {
            movieGenre {
              title
            }
          }
        }
      }
    }
    tvshows {
      nodes {
        id
        title
        genres {
          nodes {
            tvshowGenre {
              title
            }
          }
        }
      }
    }
    channels {
      nodes {
        id
        title
        description
        dashStreamUrl
        hlsStreamUrl
        keyId
        playlists {
          nodes {
            id
            startDateTime
            endDateTime
          }
        }
      }
    }
  }
`;

export const getAllMoviesQuery = gql`
  query GetAllMovies {
    movies {
      nodes {
        id
        title
        genres {
          nodes {
            movieGenre {
              title
            }
          }
        }
      }
    }
  }
`;

export const getAllTvShowsQuery = gql`
  query GetAllTvShows {
    tvshows {
      nodes {
        id
        title
        genres {
          nodes {
            tvshowGenre {
              title
            }
          }
        }
      }
    }
  }
`;

export const getAllChannelsQuery = gql`
  query GetAllChannels {
    channels {
      nodes {
        id
        title
        description
        dashStreamUrl
        hlsStreamUrl
        keyId
        playlists {
          nodes {
            id
            startDateTime
            endDateTime
            programs(orderBy: SORT_INDEX_ASC) {
              nodes {
                id
                sortIndex
                title
                movie {
                  title
                }
                episode {
                  title
                }
                id
              }
            }
          }
        }
      }
    }
  }
`;
