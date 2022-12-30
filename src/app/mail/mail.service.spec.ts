import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { SendConfirmAccountMailInterface } from './interface/send-confirm-account-mail.interface';
import { MailService } from './mail.service';

describe('MailService', () => {
  let mailService: MailService;
  let smtpService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
    smtpService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(mailService).toBeDefined();
    expect(smtpService).toBeDefined();
  });

  describe('sendConfirmAccountMail', () => {
    it('should send an account confirmation email with success', async () => {
      //Arrange
      const mailProps: SendConfirmAccountMailInterface = {
        to: {
          name: 'cliente',
          email: 'cliente@yopmail.com',
        },
        confirmationUrl: 'teste.com',
      };

      jest.spyOn(smtpService, 'sendMail').mockResolvedValue({
        response: {
          accepted: [mailProps.to.email],
        },
      });

      //Act
      const result = await mailService.sendConfirmAccountMail(mailProps);
      // Assert
      expect(result).toBeTruthy();
      expect(smtpService.sendMail).toBeCalledTimes(1);
    });
  });
});
