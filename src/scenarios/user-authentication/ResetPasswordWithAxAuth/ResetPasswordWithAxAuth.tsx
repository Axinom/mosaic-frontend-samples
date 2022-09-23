import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import {
  UserAuthConfig,
  UserServiceConfig,
  UserServiceProvider,
  useUserService,
} from '@axinom/mosaic-user-auth';
import { ResetPasswordResponseCode } from '@axinom/mosaic-user-auth-utils';
import { useState } from 'react';
import {
  Button,
  Container,
  Divider,
  Form,
  FormProps,
  Header,
  Label,
  Segment,
} from 'semantic-ui-react';

export const ResetPasswordWithAxAuthContainer: React.FC = () => {
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
    <>
      <Segment basic>
        <Header size="huge">Reset Password</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
          <Label>ax-auth-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to reset the password of an
            email/password account.
          </p>

          <p>
            The scenario execution is split into two stages. In the first stage,
            you can initiate the reset password process. This will generate a
            Reset-Password OTP and invoke the webhook that is configured under
            the AxAuth Service (as configured via the AdminPortal &gt; AxAuth
            Service Configuration &gt; End-User User Store Details).
          </p>

          <p>
            It is possible to use a temporary webhook testing website (such as
            &nbsp;<a href="https://webhook.site">https://webhook.site</a>) to
            generate a unique webhook URL and configure the AxAuth Service.
          </p>

          <p>
            This will allow you to get hold-of the Reset-Password OTP and
            manually paste it into the <b>Reset-Password OTP</b> field of the
            second stage of the scenario to complete the Reset Password process.
          </p>
        </Container>

        <Divider />

        <UserServiceProvider
          userAuthConfig={userAuthConfig}
          userServiceConfig={userServiceConfig}
        >
          <ResetPasswordWithAxauth></ResetPasswordWithAxauth>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const ResetPasswordWithAxauth: React.FC = () => {
  const { logger } = useScenarioHost();
  const { initiateResetPassword, completeResetPassword } = useUserService();

  const [email, setEmail] = useState<string>('');
  const [resetOTP, setResetOTP] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const handleInitiateResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
    _data: FormProps,
  ): Promise<void> => {
    event.preventDefault();

    if (!/\S+@\S+\.\S+/.test(email)) {
      logger.warn(
        `calling [initiateResetPassword]`,
        `output: Incorrect email format. Please try again`,
      );
    } else {
      const passwordResetResponse = await initiateResetPassword(email);

      if (passwordResetResponse.code === ResetPasswordResponseCode.SUCCESS) {
        logger.log(
          `calling ['Forget Password']`,
          'output:',
          passwordResetResponse,
        );
      } else {
        logger.error(
          `calling ['Forget Password']`,
          'output:',
          passwordResetResponse,
        );
      }
    }
  };

  const handleCompleteResetPasswordClick = async (
    event: React.FormEvent<HTMLFormElement>,
    _data: FormProps,
  ): Promise<void> => {
    event.preventDefault();

    if (newPassword.length < 8) {
      logger.warn(
        `calling [initiateSignUp]`,
        `output: New Password length must be at least 8 characters`,
      );
    } else if (resetOTP === '') {
      logger.warn(
        `calling [completeSignUp]`,
        'output: The Sign-Up OTP is required to complete the Sign-Up process. Please try again.',
      );
    } else {
      const completeResetPwResponse = await completeResetPassword({
        newPassword,
        resetOtp: resetOTP,
      });

      if (completeResetPwResponse.code === ResetPasswordResponseCode.SUCCESS) {
        logger.log(
          `calling ['Complete Forget Password']`,
          'output:',
          completeResetPwResponse,
        );
      } else {
        logger.error(
          `calling ['Complete Forget Password']`,
          'output:',
          completeResetPwResponse,
        );
      }
    }
  };

  return (
    <>
      <Form onSubmit={handleInitiateResetPassword}>
        <Form.Input width={12}>
          <Form.Input
            width={4}
            icon="user"
            iconPosition="left"
            placeholder="Email"
            label="Email"
            type="email"
            onChange={(event) => setEmail(event.target.value)}
            value={email}
          />
        </Form.Input>

        <Button type="submit" primary>
          Initiate Reset Password
        </Button>
      </Form>

      <Divider />

      <Form onSubmit={handleCompleteResetPasswordClick}>
        <Form.Input
          width={4}
          icon="lock"
          iconPosition="left"
          label="New password"
          placeholder="New password"
          type="password"
          onChange={(event) => setNewPassword(event.target.value)}
          value={newPassword}
        />
        <Form.Input
          width={4}
          icon="key"
          iconPosition="left"
          placeholder="Enter the Reset-Password OTP"
          label="Reset-Password OTP"
          onChange={(event) => setResetOTP(event.target.value)}
          value={resetOTP}
        />

        <Button type="submit" primary>
          Complete Reset Password
        </Button>
      </Form>
    </>
  );
};
