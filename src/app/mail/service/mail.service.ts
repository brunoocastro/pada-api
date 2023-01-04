import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { mailHelper } from '../../../helpers/mail.helper';
import { SendAccountVerificationMail } from './../interface/send-account-verification-mail.interface';
import { SendMailInterface } from './../interface/send-mail.interface';
import { getVerificationTemplate } from './../template/generic-confirmation.template';

@Injectable()
export class MailService {
  readonly projectName = process.env.PROJECT_NAME;
  readonly projectUrl = process.env.PROJECT_URL;
  constructor(private readonly smtpService: MailerService) {}

  private async sendMail(params: SendMailInterface): Promise<boolean> {
    const sendedMailResponse = await this.smtpService.sendMail({
      subject: params.subject,
      to: {
        address: params.to.email,
        name: params.to.name,
      },
      html: params.html,
    });

    return sendedMailResponse.accepted.includes(params.to.email);
  }

  async sendAccountVerificationMail({
    to,
    confirmationUrl,
  }: SendAccountVerificationMail) {
    const sendedMail = await this.sendMail({
      subject: mailHelper.accountVerification.subject,
      html: getVerificationTemplate({
        actionType: mailHelper.accountVerification.actionType,
        confirmationUrl,
        projectName: this.projectName,
        projectUrl: this.projectUrl,
        titleText: mailHelper.accountVerification.titleText,
      }),
      to,
    });

    return sendedMail;
  }
}
