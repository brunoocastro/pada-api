export interface SendAccountVerificationMail {
  to: {
    name: string;
    email: string;
  };
  confirmationUrl: string;
}
