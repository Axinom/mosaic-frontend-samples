import gql from 'graphql-tag';

export const getMovieImagesQuery = gql`
  query GetMovieImages($id: String!) {
    movie(id: $id) {
      title
      images {
        nodes {
          id
          width
          height
          path
          type
        }
      }
    }
  }
`;

export const getTvShowImagesQuery = gql`
  query GetTvShowImages($id: String!) {
    tvshow(id: $id) {
      title
      images {
        nodes {
          id
          width
          height
          path
          type
        }
      }
    }
  }
`;

export const getSeasonImagesQuery = gql`
  query GetSeasonImages($id: String!) {
    season(id: $id) {
      title
      images {
        nodes {
          id
          width
          height
          path
          type
        }
      }
    }
  }
`;

export const getEpisodeImagesQuery = gql`
  query GetEpisodeImages($id: String!) {
    episode(id: $id) {
      title
      images {
        nodes {
          id
          width
          height
          path
          type
        }
      }
    }
  }
`;