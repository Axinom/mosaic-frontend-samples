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
import { getSubscriptionPlansQuery } from './graphql-documents';
import * as countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import {
  UserAuthConfig,
  UserServiceConfig,
  UserServiceProvider,
  useUserService,
} from '@axinom/mosaic-user-auth';

export const ListSubscriptionPlansAnonymouslyContainer: React.FC = () => {
  const { activeProfile } = useScenarioHost();

  const userAuthConfig: UserAuthConfig = {
    userAuthBaseUrl: activeProfile.userAuthBaseURL,
    tenantId: activeProfile.tenantId,
    environmentId: activeProfile.environmentId,
    applicationId: activeProfile.applicationId,
  };

  const userServiceConfig: UserServiceConfig = {
    userServiceBaseUrl: activeProfile.userServiceBaseURL,
  };

  return (
    <Segment basic>
      <Header size="huge">List Subscription Plans Anonymously</Header>
      <Header size="small">
        Required Services:
        <Label>billing-service & monetization-service & ax-user-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>
          This scenario demonstrates how to get subscription plans without a
          user being logged in. It uses the Application Key value (defined in
          the selected profile settings) for generating the application token.
          With the help of the token the list of subscription plans can be
          retrieved.
        </p>
      </Container>

      <Divider />
      <UserServiceProvider
        userAuthConfig={userAuthConfig}
        userServiceConfig={userServiceConfig}
      >
        <ListSubscriptionPlansAnonymously></ListSubscriptionPlansAnonymously>
      </UserServiceProvider>
    </Segment>
  );
};

export const ListSubscriptionPlansAnonymously: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const { authenticateEndUserApplication } = useUserService();

  // Get all country names and country codes by ISO 3166-1 and stored in the array
  countries.registerLocale(en);

  const countryArr = Object.entries(
    countries.getNames('en', { select: 'official' }),
  ).map(([key, value]) => {
    return {
      label: value,
      value: key,
    };
  });

  const fetchApplicationToken = async (): Promise<void> => {
    try {
      const authenticateEndUserApplicationRequest = {
        tenantId: activeProfile.tenantId,
        environmentId: activeProfile.environmentId,
        applicationId: activeProfile.applicationId,
        applicationKey: activeProfile.applicationKey,
      };

      const appTokenResult = await authenticateEndUserApplication(
        authenticateEndUserApplicationRequest,
      );

      setAccessToken(appTokenResult.endUserApplicationToken?.accessToken);
      logger.log(
        'calling [fetchApplicationToken]',
        'output:',
        JSON.stringify(appTokenResult.endUserApplicationToken?.accessToken),
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          'method [fetchApplicationToken]',
          'output:',
          error.message,
        );
      } else {
        logger.error(
          'method [fetchApplicationToken]',
          'output:',
          JSON.stringify(error),
        );
      }
    }
  };

  const getSubscriptionPlans = async (): Promise<void> => {
    try {
      const apolloClient = getApolloClient(
        new URL('graphql', activeProfile.billingServiceBaseURL).href,
      );

      let subscriptionPlanFilter;
      let paymentPlanPriceFilter;
      if (selectedCountry !== '') {
        subscriptionPlanFilter = {
          paymentPlans: {
            every: {
              prices: { some: { country: { equalTo: selectedCountry } } },
            },
          },
        };
        paymentPlanPriceFilter = { country: { equalTo: selectedCountry } };
      }

      const result = await apolloClient.query({
        query: getSubscriptionPlansQuery,
        variables: { subscriptionPlanFilter, paymentPlanPriceFilter },
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
      } else {
        logger.error(
          'method [listSubscriptionPlans]',
          'output:',
          JSON.stringify(error),
        );
      }
    }
  };

  return (
    <>
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
                placeholder="Application Token"
                type="text"
                label="Application Token"
                value={accessToken}
                onChange={(event) => {
                  setAccessToken(event.target.value);
                }}
              />

              <Divider />

              <Form.Dropdown
                clearable
                search
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

              <Form.Button primary onClick={getSubscriptionPlans}>
                List Subscription Plans
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    </>
  );
};
