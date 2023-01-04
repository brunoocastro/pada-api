import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { SendAccountVerificationMail } from '../interface/send-account-verification-mail.interface';
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
            sendMail: jest.fn(),
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

  describe('sendAccountVerificationMail', () => {
    it('should send an account confirmation email with success', async () => {
      //Arrange
      const mailProps: SendAccountVerificationMail = {
        to: {
          name: 'cliente',
          email: 'cliente@yopmail.com',
        },
        confirmationUrl: 'teste.com',
      };

      jest.spyOn(smtpService, 'sendMail').mockResolvedValueOnce({
        accepted: [mailProps.to.email],
      });

      //Act
      const result = await mailService.sendAccountVerificationMail(mailProps);

      // Assert
      expect(result).toBeTruthy();
      expect(smtpService.sendMail).toBeCalledTimes(1);
    });
  });
});
