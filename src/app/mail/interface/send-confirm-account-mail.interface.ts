export interface SendConfirmAccountMailInterface {
  to: {
    name: string;
    email: string;
  };
  confirmationUrl: string;
}
