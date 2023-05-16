import gql from 'graphql-tag';

export const getMoviesQuery = gql`
  query GetMovies {
    movies {
      nodes {
        id
        title
      }
    }
  }
`;

export const getTvShowsQuery = gql`
  query GetTvShows {
    tvshows {
      nodes {
        id
        title
      }
    }
  }
`;

export const setArrayItemMutation = gql`
  mutation SetArrayItem($input: SetArrayItemInput!) {
    setArrayItem(input: $input) {
      acknowledged
      insertedCount
      modifiedCount
    }
  }
`;
