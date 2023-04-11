import gql from 'graphql-tag';

export const SetProgressMutation = gql`
  mutation SetProgress($input: SetProgressInput!) {
    setProgress(input: $input) {
      acknowledged
    }
  }
`;
