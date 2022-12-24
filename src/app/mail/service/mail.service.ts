import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { SendMailInterface } from '../interface/send-mail.interface';
import { lastValueFrom } from 'rxjs';
import { mailHelper } from '../../../helpers/mail.helper';
import { getGenericConfirmationTemplate } from '../template/generic-confirmation.template';
import { SendConfirmAccountMailInterface } from '../interface/send-confirm-account-mail.interface';

@Injectable()
export class MailService {
  private readonly MAIL_API_URL = process.env.MAIL_API_URL;
  private readonly MAIL_API_SECRET_KEY = process.env.MAIL_API_SECRET_KEY;
  constructor(private readonly httpService: HttpService) {}

  private async sendMail(params: SendMailInterface): Promise<boolean> {
    const url = `${this.MAIL_API_URL}/mail/send`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.MAIL_API_SECRET_KEY}`,
      },
    };
    const response = await lastValueFrom(
      this.httpService.post(url, params, config),
    );

    console.log({ response });
    return response.status === HttpStatus.ACCEPTED;
  }

  async sendConfirmAccountMail({
    to,
    confirmationUrl,
  }: SendConfirmAccountMailInterface) {
    const sendedMail = await this.sendMail({
      subject: mailHelper.accountConfirmation.subject,
      content: [
        {
          type: 'text/html',
          value: getGenericConfirmationTemplate({
            actionType: mailHelper.accountConfirmation.actionType,
            confirmationUrl,
            projectName: mailHelper.projectName,
            projectUrl: mailHelper.projectUrl,
            titleText: mailHelper.accountConfirmation.titleText,
          }),
        },
      ],
      from: mailHelper.from,
      reply_to: mailHelper.reply_to,
      personalizations: [
        {
          to,
        },
      ],
    });

    return sendedMail;
  }
}
