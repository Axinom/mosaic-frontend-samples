import gql from 'graphql-tag';

export const getMovieVideosQuery = gql`
  query GetMovieVideos($id: String!) {
    movie(id: $id) {
      title
      videos {
        nodes {
          id
          title
          type
          isProtected
          outputFormat
          hlsManifest
          dashManifest
        }
      }
    }
  }
`;

export const getTvShowVideosQuery = gql`
  query GetTvShowVideos($id: String!) {
    tvshow(id: $id) {
      title
      videos {
        nodes {
          id
          title
          type
          isProtected
          outputFormat
          hlsManifest
          dashManifest
        }
      }
    }
  }
`;

export const getSeasonVideosQuery = gql`
  query GetSeasonVideos($id: String!) {
    season(id: $id) {
      title
      videos {
        nodes {
          id
          title
          type
          isProtected
          outputFormat
          hlsManifest
          dashManifest
        }
      }
    }
  }
`;

export const getEpisodeVideosQuery = gql`
  query GetEpisodeVideos($id: String!) {
    episode(id: $id) {
      title
      videos {
        nodes {
          id
          title
          type
          isProtected
          outputFormat
          hlsManifest
          dashManifest
        }
      }
    }
  }
`;
