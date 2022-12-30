import { MailerService } from '@nestjs-modules/mailer';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { mailHelper } from '../../helpers/mail.helper';
import { SendConfirmAccountMailInterface } from './interface/send-confirm-account-mail.interface';
import { SendMailInterface } from './interface/send-mail.interface';
import { getGenericConfirmationTemplate } from './template/generic-confirmation.template';

@Injectable()
export class MailService {
  constructor(
    private readonly httpService: HttpService,
    private readonly smtpService: MailerService,
  ) {}

  private async sendMail(params: SendMailInterface): Promise<boolean> {
    const response = await this.smtpService.sendMail({
      subject: params.subject,
      to: {
        address: params.to.email,
        name: params.to.name,
      },
      html: params.html,
    });

    return response.status === HttpStatus.ACCEPTED;
  }

  async sendConfirmAccountMail({
    to,
    confirmationUrl,
  }: SendConfirmAccountMailInterface) {
    const sendedMail = await this.sendMail({
      subject: mailHelper.accountConfirmation.subject,
      html: getGenericConfirmationTemplate({
        actionType: mailHelper.accountConfirmation.actionType,
        confirmationUrl,
        projectName: mailHelper.projectName,
        projectUrl: mailHelper.projectUrl,
        titleText: mailHelper.accountConfirmation.titleText,
      }),
      to,
    });

    return sendedMail;
  }
}
