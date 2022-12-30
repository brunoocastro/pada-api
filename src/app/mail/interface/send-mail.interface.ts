interface To {
  email: string;
  name: string;
}

export interface SendMailInterface {
  to: To;
  subject: string;
  html: string;
}
