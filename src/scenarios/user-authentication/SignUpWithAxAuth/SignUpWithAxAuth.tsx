import { useScenarioHost } from '@axinom/mosaic-fe-samples-host';
import {
  UserAuthConfig,
  UserServiceConfig,
  UserServiceProvider,
  useUserService,
} from '@axinom/mosaic-user-auth';
import {
  CompleteUserSignUpResponseCode,
  UserSignUpResponseCode,
} from '@axinom/mosaic-user-auth-utils';
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

export const SignUpWithAxAuthContainer: React.FC = () => {
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
        <Header size="huge">Sign-Up With Email/Password</Header>
        <Header size="small">
          Required Services:
          <Label>ax-user-service</Label>
          <Label>ax-auth-service</Label>
        </Header>

        <Divider />

        <Container fluid>
          <p>
            This scenario demonstrates how to Sign-Up for an account using an
            email and password.
          </p>

          <p>
            The scenario execution is split into two stages. In the first stage,
            you can initiate the sign-up process. This will generate a Sign-Up
            OTP and invoke the webhook that is configured under the AxAuth
            Service (as configured via the AdminPortal &gt; AxAuth Service
            Configuration &gt; End-User User Store Details).
          </p>

          <p>
            It is possible to use a temporary webhook testing website (such as
            &nbsp;<a href="https://webhook.site">https://webhook.site</a>) to
            generate a unique webhook URL and configure the AxAuth Service.
          </p>

          <p>
            This will allow you to get hold of the Sign-Up OTP and manually
            paste it into the <b>Sign-Up OTP</b> field of the second stage of
            the scenario to complete the Sign-Up process.
          </p>
        </Container>

        <Divider />

        <UserServiceProvider
          userAuthConfig={userAuthConfig}
          userServiceConfig={userServiceConfig}
        >
          <SignUpWithAxAuth></SignUpWithAxAuth>
        </UserServiceProvider>
      </Segment>
    </>
  );
};

export const SignUpWithAxAuth: React.FC = () => {
  const { logger } = useScenarioHost();
  const { initiateUserSignUp, completeUserSignUp } = useUserService();

  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [signUpOtp, setSignUpOtp] = useState<string>('');

  const initiateSignUp = async (
    event: React.FormEvent<HTMLFormElement>,
    _data: FormProps,
  ): Promise<void> => {
    event.preventDefault();

    if (!/\S+@\S+\.\S+/.test(email)) {
      logger.warn(
        `calling [initiateSignUp]`,
        `output: Incorrect email format. Please try again`,
      );
    } else if (firstName.trim().length === 0 || lastName.trim().length === 0) {
      logger.warn(
        `calling [initiateSignUp]`,
        `output: First Name & Last Name are required. Please try again`,
      );
    } else if (password.length < 8) {
      logger.warn(
        `calling [initiateSignUp]`,
        `output: Password length must be at least 8 characters`,
      );
    } else if (password === confirmPassword) {
      const signUpResponse = await initiateUserSignUp({
        email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (signUpResponse.code === UserSignUpResponseCode.SUCCESS) {
        logger.log(`calling [initiateSignUp]`, 'output:', signUpResponse);
      } else {
        logger.error(`calling [initiateSignUp]`, 'output:', signUpResponse);
      }
    } else {
      logger.warn(
        `calling [initiateSignUp]`,
        `output: Passwords do not match. Please try again`,
      );
    }
  };

  const completeSignUp = async (
    event: React.FormEvent<HTMLFormElement>,
    _data: FormProps,
  ): Promise<void> => {
    event.preventDefault();

    if (signUpOtp === '') {
      logger.warn(
        `calling [completeSignUp]`,
        'output: The Sign-Up OTP is required to complete the Sign-Up process. Please try again.',
      );
    } else {
      const completeSignUpResponse = await completeUserSignUp({
        signUpOtp,
      });

      if (
        completeSignUpResponse.code === CompleteUserSignUpResponseCode.SUCCESS
      ) {
        logger.log(
          `calling [completeSignUp]`,
          'output:',
          completeSignUpResponse,
        );
      } else {
        logger.error(
          `calling [completeSignUp]`,
          'output:',
          completeSignUpResponse,
        );
      }
    }
  };

  return (
    <>
      <Form onSubmit={initiateSignUp}>
        <Form.Group>
          <Form.Input
            width={4}
            icon="user"
            iconPosition="left"
            placeholder="Email"
            type="email"
            label="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </Form.Group>

        <Form.Group>
          <Form.Input
            width={4}
            icon="id card outline"
            iconPosition="left"
            placeholder="First Name"
            type="text"
            label="First Name"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
            }}
          />

          <Form.Input
            width={4}
            icon="id card outline"
            iconPosition="left"
            placeholder="Last Name"
            type="text"
            label="Last Name"
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
            }}
          />
        </Form.Group>

        <Form.Group>
          <Form.Input
            width={4}
            icon="lock"
            iconPosition="left"
            placeholder="Password"
            type="password"
            label="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />

          <Form.Input
            width={4}
            icon="lock"
            iconPosition="left"
            placeholder="Confirm Password"
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
          />
        </Form.Group>

        <Button type="submit" primary>
          Initiate Sign Up
        </Button>
      </Form>

      <Divider />

      <Form onSubmit={completeSignUp}>
        <Form.Group>
          <Form.Input
            width={4}
            icon="key"
            iconPosition="left"
            placeholder="Enter the Sign-Up OTP"
            label="Sign Up OTP"
            onChange={(event) => setSignUpOtp(event.target.value)}
            value={signUpOtp}
          />
        </Form.Group>

        <Button type="submit" primary>
          Complete Sign Up
        </Button>
      </Form>
    </>
  );
};
