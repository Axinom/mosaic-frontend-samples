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
      }
    }
  }
`;
