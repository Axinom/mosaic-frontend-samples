import { useState } from 'react';
import {
  Button,
  Container,
  Divider,
  Form,
  Header,
  Label,
  Segment,
  List,
} from 'semantic-ui-react';
import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';

interface OverviewPage {
  name: string;
  url: string;
}

export const UnsubscribeFromSubscriptionPlanStripe: React.FC = () => {
  const { activeProfile, logger } = useScenarioHost();
  const [userAccessToken, setUserAccessToken] = useState<string>();
  const [overviewPages, setOverviewPages] = useState<OverviewPage[] | null>(
    null,
  );

  const fetchStripeOverviewPages = async (): Promise<void> => {
    try {
      const overviewUrl = new URL(
        'customer-overview',
        activeProfile.stripePaymentConnectorBaseURL,
      ).href;

      const result = await fetch(overviewUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + userAccessToken,
        },
      });

      if (result.ok) {
        const overviewData = await result.json();
        setOverviewPages(overviewData);
        logger.log(
          `method [${fetchStripeOverviewPages.name}]`,
          'output:',
          overviewData,
        );
      } else {
        setOverviewPages(null);
        logger.error(
          `method [${fetchStripeOverviewPages.name}]`,
          'output:',
          result.statusText,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `method [${fetchStripeOverviewPages.name}]`,
          'output:',
          error.message,
        );
      }
    }
  };

  return (
    <>
      <Segment basic>
        <Header size="huge">
          Unsubscribe from a Subscription Plan (with Stripe)
        </Header>
        <Header size="small">
          Required Services:
          <Label>user-service</Label>
          <Label>billing-service & monetization-service</Label>
          <Label>stripe-payment-connector</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            The scenario demonstrates how to unsubscribe from the active
            subscription of a logged-in user.
          </p>

          <p>
            Stripe provides overview pages to get an overview of the current and
            past subscriptions of the user. There is one overview page per user
            for every currency that they used for the purchases.
          </p>

          <p>
            The scenario execution is split into two stages. In the first stage,
            you can fetch the Stripe overview pages for the user.
          </p>

          <p>
            In the second stage, you can click on the link to the desired
            overview page. This will open the overview page in a new tab, where
            you can find and cancel the currently active subscription. You can
            verify the status of the subscription afterwards by using the
            &apos;List User Subscriptions&apos; scenario.
          </p>

          <p>
            If the user is not already signed-in, you can use one of the Sign-In
            scenarios.
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

          <Button
            primary
            onClick={async () => {
              fetchStripeOverviewPages();
            }}
          >
            Fetch Stripe Overview Pages
          </Button>

          {overviewPages &&
            (overviewPages.length > 0 ? (
              <>
                <Divider />
                <p>Overview Pages</p>
                <List>
                  {overviewPages.map((page) => (
                    <List.Item
                      as="a"
                      key={page.name}
                      href={page.url}
                      target="_blank"
                    >
                      {page.name}
                    </List.Item>
                  ))}
                </List>
              </>
            ) : (
              <>
                <Divider />
                <p>No overview pages found</p>
              </>
            ))}
        </Form>
      </Segment>
    </>
  );
};
