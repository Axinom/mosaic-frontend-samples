import {
  useScenarioHost,
  VariableSearch,
} from '@axinom/mosaic-fe-samples-host';
import {
  UserAuthConfig,
  UserServiceConfig,
  UserServiceProvider,
  useUserService,
} from '@axinom/mosaic-user-auth';
import {
  DeviceAuthorizationResponse,
  DeviceAuthorizationResponseCode,
  DevicePollResponseCode,
} from '@axinom/mosaic-user-auth-utils';
import { useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import {
  Button,
  Container,
  Divider,
  Form,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';

export const DeviceAuthorizationContainer: React.FC = () => {
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
      <Header size="huge">Device Authorization (Smart-TV Sign-In)</Header>
      <Header size="small">
        Required Services:
        <Label>ax-user-service</Label>
        <Label>ax-auth-service</Label>
      </Header>

      <Divider />

      <Container fluid>
        <p>
          Signs a user in on an input-constrained device (e.g. a Smart TV) using
          the device authorization flow. The device shows a short code, the user
          opens the verification URL on a phone or laptop and approves it, and
          the device is then signed in.
        </p>
        <p>
          Steps 1, 2 and 4 run on the device; step 3 runs on the second (already
          signed-in) device. This one sample plays both roles; in production the
          device is a NATIVE application and the activation page a separate WEB
          application sharing the same user store. Step 3 needs a signed-in
          user: run a Sign-In scenario first, then select its stored access
          token in the field below.
        </p>
      </Container>

      <Divider />

      <UserServiceProvider
        userAuthConfig={userAuthConfig}
        userServiceConfig={userServiceConfig}
      >
        <DeviceAuthorization />
      </UserServiceProvider>
    </Segment>
  );
};

const DeviceAuthorization: React.FC = () => {
  const { logger } = useScenarioHost();
  const {
    requestDeviceAuthorization,
    pollDeviceRefreshToken,
    getDeviceAccessToken,
    getDeviceVerification,
    approveDevice,
    denyDevice,
  } = useUserService();

  const [deviceLabel, setDeviceLabel] = useState('Living Room TV');
  const [authorization, setAuthorization] = useState<
    DeviceAuthorizationResponse | undefined
  >();
  const [isPolling, setIsPolling] = useState(false);
  const [refreshToken, setRefreshToken] = useState<string | undefined>();
  const pollAbortController = useRef<AbortController | undefined>(undefined);

  const [userCode, setUserCode] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Step 1 (device): start the flow and receive the user code + verification URL to display, plus
  // the device code used to poll.
  const requestCode = async (): Promise<void> => {
    const response = await requestDeviceAuthorization({ deviceLabel });
    setAuthorization(response);
    if (response.code === DeviceAuthorizationResponseCode.SUCCESS) {
      setUserCode(response.userCode ?? ''); // pre-fill step 3, as if read off the screen
      logger.log('calling [requestDeviceAuthorization]', 'output:', response);
    } else {
      logger.error('calling [requestDeviceAuthorization]', 'output:', response);
    }
  };

  // Step 2 (device): poll until the user approves on the other device. pollDeviceRefreshToken
  // honours the server interval and SLOW_DOWN back-off; on SUCCESS it returns the refresh token
  // (the device's long-lived credential). Access tokens come from step 4.
  const pollForApproval = async (): Promise<void> => {
    if (authorization?.deviceCode === undefined) {
      return;
    }
    pollAbortController.current = new AbortController();
    setIsPolling(true);
    try {
      const response = await pollDeviceRefreshToken(authorization.deviceCode, {
        intervalSeconds: authorization.interval ?? 5,
        signal: pollAbortController.current.signal,
        onPending: (pollResponse) =>
          logger.log('polling [device/poll]', 'output:', pollResponse),
      });
      if (response.code === DevicePollResponseCode.SUCCESS) {
        setRefreshToken(response.refreshToken); // persist this on the device for step 4
        logger.log('calling [pollDeviceRefreshToken]', 'output:', response);
      } else {
        logger.error('calling [pollDeviceRefreshToken]', 'output:', response);
      }
    } catch {
      logger.log('calling [pollDeviceRefreshToken]', 'output: polling stopped');
    } finally {
      setIsPolling(false);
    }
  };

  const stopPolling = (): void => pollAbortController.current?.abort();

  // Step 3 (activation page): show the signed-in user what the code will authorize.
  const lookUpCode = async (): Promise<void> => {
    const response = await getDeviceVerification(userCode);
    logger.log('calling [getDeviceVerification]', 'output:', response);
  };

  // Step 3 (activation page): approve or deny on behalf of the signed-in user, identified by
  // their access token.
  const approve = async (): Promise<void> => {
    logger.log(
      'calling [approveDevice]',
      'output:',
      await approveDevice(accessToken, userCode),
    );
  };

  const deny = async (): Promise<void> => {
    logger.log(
      'calling [denyDevice]',
      'output:',
      await denyDevice(accessToken, userCode),
    );
  };

  // Step 4 (device): exchange the refresh token for an access token via the standard /token
  // endpoint. Used for the first access token right after approval, and for every later renewal
  // (the refresh token is not rotated, so it is reused each time).
  const getAccessToken = async (): Promise<void> => {
    if (refreshToken === undefined) {
      return;
    }
    logger.log(
      'calling [getDeviceAccessToken]',
      'output:',
      await getDeviceAccessToken(refreshToken),
    );
  };

  return (
    <Form>
      <Header size="medium">On the Device</Header>
      <Form.Input
        label="Device Label (optional, shown to the user)"
        value={deviceLabel}
        onChange={(event) => setDeviceLabel(event.target.value)}
      />
      <Button type="button" primary onClick={requestCode}>
        Step 1: Request a Device Code
      </Button>

      {authorization?.code === DeviceAuthorizationResponseCode.SUCCESS && (
        <Segment secondary>
          <p>
            User Code: <Label>{authorization.userCode}</Label>
          </p>
          <p>
            Verification URL: <code>{authorization.verificationUri}</code>
          </p>
          <p>
            Expires in {authorization.expiresIn}s · poll every{' '}
            {authorization.interval}s
          </p>
          {authorization.verificationUriComplete !== undefined && (
            <>
              <p>
                Or scan to open the activation page with the code prefilled:
              </p>
              {/* verificationUriComplete embeds the user code, so it is rendered
                  client-side and never sent to an external QR service. */}
              <QRCode
                value={authorization.verificationUriComplete}
                size={160}
              />
            </>
          )}
        </Segment>
      )}

      <Button
        type="button"
        primary
        disabled={
          authorization?.code !== DeviceAuthorizationResponseCode.SUCCESS ||
          isPolling
        }
        loading={isPolling}
        onClick={pollForApproval}
      >
        Step 2: Poll for Approval
      </Button>
      {isPolling && (
        <Button type="button" onClick={stopPolling}>
          Stop Polling
        </Button>
      )}

      <Divider />

      <Header size="medium">On the Activation Page (Signed-In User)</Header>
      <Form.Input
        label="User Code"
        value={userCode}
        onChange={(event) => setUserCode(event.target.value)}
      />
      <Form.Input
        control={VariableSearch}
        icon="key"
        label="Access Token (select the token stored by a Sign-In scenario)"
        value={accessToken}
        setStateValue={setAccessToken}
      />
      <Button type="button" onClick={lookUpCode}>
        Step 3: Look Up the Code
      </Button>
      <Button type="button" positive onClick={approve}>
        Approve
      </Button>
      <Button type="button" negative onClick={deny}>
        Deny
      </Button>

      <Divider />
      <Header size="medium">On the Device</Header>
      <Button
        type="button"
        disabled={refreshToken === undefined}
        onClick={getAccessToken}
      >
        Step 4: Get an Access Token
      </Button>
    </Form>
  );
};
