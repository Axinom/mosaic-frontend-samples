import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import { Icon, Message } from 'semantic-ui-react';
import type { ScenarioKey } from '../../../scenario-registry';

const MIGRATION_GUIDE_URL =
  'https://docs.axinom.com/services/personalization/array-api/migrate-from-deprecated-apis';

/**
 * Links to another scenario by its `shortId`, labelled with the registered display name.
 * The host routes every scenario at `/${shortId}`.
 */
export const ScenarioLink: React.FC<{ shortId: ScenarioKey }> = ({
  shortId,
}) => {
  const { scenarios } = useScenarioHost();
  const displayName =
    scenarios.find((scenario) => scenario.shortId === shortId)?.displayName ??
    shortId;

  return <a href={`/${shortId}`}>{displayName}</a>;
};

/**
 * Warning shown on scenarios that demonstrate deprecated Array APIs.
 */
export const DeprecatedApiNotice: React.FC = ({ children }) => (
  <Message warning icon>
    <Icon name="warning sign" />
    <Message.Content>
      <Message.Header>This scenario uses deprecated Array APIs</Message.Header>
      {children}
      <p>
        Deprecated APIs remain available for backward compatibility and no
        removal date is currently scheduled. New integrations should use the
        recommended Array APIs. See{' '}
        <a href={MIGRATION_GUIDE_URL} target="_blank" rel="noreferrer">
          Migrate from deprecated Array APIs
        </a>
        .
      </p>
    </Message.Content>
  </Message>
);

/**
 * Info banner shown on scenarios that demonstrate the recommended Array APIs.
 */
export const RecommendedApiNotice: React.FC = ({ children }) => (
  <Message info icon>
    <Icon name="check circle" />
    <Message.Content>
      <Message.Header>Recommended Array API</Message.Header>
      {children}
    </Message.Content>
  </Message>
);
