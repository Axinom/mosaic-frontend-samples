import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import { useState } from 'react';
import {
  Container,
  Divider,
  Form,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import { getApolloClient } from '../../../apollo-client';
import { getEntitlementMessageQuery } from './graphql-documents';

export const GetEntitlementMessage: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();

  const [userAccessToken, setUserAccessToken] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');
  const [mockClientIp, setMockClientIp] = useState<string>();

  const getEntitlementMessage = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.entitlementServiceBaseURL).href,
      );

      const result = await apolloClient.query({
        query: getEntitlementMessageQuery,
        variables: {
          input: {
            entityId,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
            ...(mockClientIp !== undefined && {
              'mosaic-testing-ip': mockClientIp,
            }),
          },
        },
        fetchPolicy: 'no-cache',
      });

      if (result.errors) {
        logger.error(
          'calling [getEntitlementMessage]',
          'output:',
          result.errors,
        );
      } else {
        const entitlementMessage =
          result.data.entitlement.entitlementMessageJwt;

        logger.log(
          'calling [getEntitlementMessage]',
          'output:',
          result.data,
          'Entitlement message (decoded):',
          entitlementMessage
            ? JSON.parse(atob(entitlementMessage.split('.')[1]))
            : 'Entitlement JWT is missing.',
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          'calling [getEntitlementMessage]',
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <Segment basic>
      <Header size="huge">Get Entitlement Message</Header>
      <Header size="small">
        Required Services:
        <Label>user-service</Label>
        <Label>billing-service & monetization-service</Label>
        <Label>entitlement-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>
          This scenario demonstrates how to retrieve an entitlement message for
          a given media entity.
        </p>
        <p>
          A <b>User Access Token</b> and an <b>Entity ID</b> is required to
          retrieve an entitlement message for a media entity. Entitlement
          service will by default use the IP address of the request to determine
          the country of the user and to check whether the movie or episode has
          a valid playback license for that country. You can optionally provide
          a <b>Mock Client IP</b> address which will then be used to determine
          the location.
        </p>
        <p>
          The Entitlement service will additionally check if the user has an
          active subscription to a subscription plan that allows the playback of
          the entity.
        </p>
      </Container>

      <Divider />

      <Form>
        <Form.Input
          control={VariableSearch}
          width={4}
          icon="key"
          label="User Access Token"
          value={userAccessToken}
          setStateValue={setUserAccessToken}
        />
        <Form.Input
          control={VariableSearch}
          width={4}
          icon="id card outline"
          label="Entity ID"
          value={entityId}
          setStateValue={setEntityId}
        />
        <Form.Input
          control={VariableSearch}
          width={4}
          icon="id card outline"
          label="Mock Client IP"
          value={mockClientIp}
          setStateValue={setMockClientIp}
        />
        <Form.Button
          primary
          onClick={async () => {
            getEntitlementMessage();
          }}
        >
          Get Entitlement Message
        </Form.Button>
      </Form>
    </Segment>
  );
};
