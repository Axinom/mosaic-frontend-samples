import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import { useState } from 'react';
import {
  Container,
  Divider,
  Form,
  Grid,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';
import { getApolloClient } from '../../../apollo-client';
import {
  getSubscriptionPlansQuery,
  authenticateEndUserApplication,
} from './graphql-documents';
import * as countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

export const ListSubscriptionPlansAnonymously: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [accessToken, setAccessToken] = useState<string>();
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  countries.registerLocale(en);

  const countryObj = countries.getNames('en', { select: 'official' });

  const countryArr = Object.entries(countryObj).map(([key, value]) => {
    return {
      label: value,
      value: key,
    };
  });

  const fetchApplicationToken = async (): Promise<void> => {
    try {
      const apolloClientUser = getApolloClient(
        new URL('graphql-management', activeProfile.userServiceBaseURL).href,
      );
      const applicationDta = await apolloClientUser.query({
        query: authenticateEndUserApplication,
        variables: {
          input: {
            tenantId: activeProfile.tenantId,
            environmentId: activeProfile.environmentId,
            applicationId: activeProfile.applicationId,
            applicationKey: activeProfile.applicationKey,
          },
        },
        context: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
        fetchPolicy: 'no-cache',
      });

      setAccessToken(
        applicationDta.data.authenticateEndUserApplication.accessToken,
      );
      logger.log(
        'calling [fetchApplicationToken]',
        'output:',
        applicationDta.data.authenticateEndUserApplication,
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          'method [fetchApplicationToken]',
          'output:',
          error.message,
        );
      }
    }
  };

  const getSubscriptionPlans = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.billingServiceBaseURL).href,
      );

      let filter1;
      let filter2;
      if (selectedCountry !== '') {
        filter1 = {
          isActive: {
            equalTo: true,
          },
          paymentPlans: {
            every: {
              isActive: { equalTo: true },
              prices: { some: { country: { equalTo: selectedCountry } } },
            },
          },
        };
        filter2 = { country: { equalTo: selectedCountry } };
      }

      const result = await apolloClient.query({
        query: getSubscriptionPlansQuery,
        variables: { filter1, filter2 },
        context: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      logger.log('method [listSubscriptionPlans]', 'output:', result.data);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          'method [listSubscriptionPlans]',
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <Segment basic>
      <Header size="huge">List Subscription Plans Anonymously</Header>
      <Header size="small">
        Required Services:
        <Label>billing-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>
          This scenario demonstrates how to get subscription plans without user
          being logged in. It uses the Application Key value (defined in the
          selected profile settings) for generating the application token. With
          the help of the token the list of subscription plans can be received.
        </p>
      </Container>

      <Divider />

      <Grid divided>
        <Grid.Column width={8}>
          <Segment basic>
            <Form>
              <Form.Button
                primary
                onClick={async () => {
                  fetchApplicationToken();
                }}
              >
                Fetch Application Token
              </Form.Button>

              <Form.Input
                icon="id card outline"
                iconPosition="left"
                placeholder="Access Token"
                type="text"
                label="Access Token"
                value={accessToken}
                onChange={(event) => {
                  setAccessToken(event.target.value);
                }}
              />

              <Divider />

              <Form.Dropdown
                fluid
                selection
                label="Country"
                placeholder="Select Country"
                options={countryArr.map((country) => {
                  return {
                    text: `${country.label} (${country.value})`,
                    value: country.value,
                  };
                })}
                value={selectedCountry}
                onChange={(event, { value }) => {
                  setSelectedCountry(value as string);
                }}
              ></Form.Dropdown>

              <Form.Button
                primary
                onClick={async () => {
                  getSubscriptionPlans();
                }}
              >
                List Subscription Plans
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};
