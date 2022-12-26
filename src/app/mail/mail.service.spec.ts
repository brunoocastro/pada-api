import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { SendConfirmAccountMailInterface } from './interface/send-confirm-account-mail.interface';
import { MailService } from './mail.service';

describe('MailService', () => {
  let mailService: MailService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(mailService).toBeDefined();
    expect(httpService).toBeDefined();
  });

  describe('sendConfirmAccountMail', () => {
    it('should send an account confirmation email with success', async () => {
      //Arrange
      const mailProps: SendConfirmAccountMailInterface = {
        to: [
          {
            name: 'cliente',
            email: 'cliente@yopmail.com',
          },
        ],
        confirmationUrl: 'teste.com',
      };

      jest.spyOn(httpService, 'post').mockReturnValueOnce(
        of({
          status: 202,
          statusText: 'ACCEPTED',
          config: {},
          headers: {},
          data: {},
        }),
      );
      //Act
      const result = await mailService.sendConfirmAccountMail(mailProps);
      // Assert
      expect(result).toBeTruthy();
      expect(httpService.post).toBeCalledTimes(1);
    });
  });
});
