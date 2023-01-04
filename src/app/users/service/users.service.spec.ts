import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import { cryptoHelper } from '../../../helpers/crypto.helper';
import { RegisterUserDto } from '../../auth/dto/register.dto';
import { MailService } from '../../mail/service/mail.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserEntity } from '../entities/user.entity';
import { UsersRepository } from '../repository/users.repository';
import { UsersService } from './users.service';

const userEntityData: UserEntity = {
  id: randomUUID(),
  email: 'tonelive@yopmail.com',
  emailStatus: 'UNVERIFIED',
  name: 'tonelive',
  password: 'SenhaSecreta123@',
  picture: 'thispersondoesnotexists.com',
  role: 'USER',
  phone: '55996279889',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const userEntity = new UserEntity(userEntityData);

const userEntityWithHashedPassword = new UserEntity({
  ...userEntity,
  password: cryptoHelper.hashPassword(userEntity.password),
});

const userEntityWithoutSensitiveData: UserEntity = {
  ...userEntity,
  password: undefined,
};

const userResponse = plainToInstance(UserResponseDto, userEntityData, {
  excludeExtraneousValues: true,
});

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepository;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue(userEntityWithHashedPassword),
            findByEmail: jest
              .fn()
              .mockResolvedValue(userEntityWithHashedPassword),
            create: jest.fn().mockResolvedValue(userEntityWithHashedPassword),
            updateById: jest
              .fn()
              .mockResolvedValue(userEntityWithHashedPassword),
            deleteById: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JwtService,
          useValue: new JwtService({
            privateKey: 'TestPrivateKey',
            secret: 'TestSecret',
          }),
        },
        {
          provide: MailService,
          useValue: {
            projectUrl: 'teste.com',
            sendAccountVerificationMail: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(usersRepository).toBeDefined();
    expect(mailService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user entity without sensitive data successfully', async () => {
      const result = await usersService.findById(
        userEntityWithoutSensitiveData.id,
      );

      expect(result).toEqual(userEntityWithoutSensitiveData);
      expect(result.password).toBeUndefined();

      expect(usersRepository.findById).toBeCalledTimes(1);
      expect(usersRepository.findById).toBeCalledWith(
        userEntityWithoutSensitiveData.id,
      );
    });

    it('should throw an exception when repository fail - findById', () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      expect(usersService.findById).rejects.toThrowError();
    });
  });

  describe('findByEmail', () => {
    it('should return a user entity without sensitive data successfully', async () => {
      const result = await usersService.findByEmail(
        userEntityWithoutSensitiveData.email,
      );

      expect(result).toEqual(userEntityWithoutSensitiveData);
      expect(result.password).toBeUndefined();

      expect(usersRepository.findByEmail).toBeCalledTimes(1);
      expect(usersRepository.findByEmail).toBeCalledWith(
        userEntityWithoutSensitiveData.email,
      );
    });

    it('should throw an exception when repository fail - findByEmail', async () => {
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockRejectedValueOnce(new Error());

      expect(usersService.findByEmail).rejects.toThrowError();
    });
  });

  describe('getExistentById', () => {
    it('should return an existent user', async () => {
      const result = await usersService.getExistentById(
        userEntityWithoutSensitiveData.id,
      );

      expect(result).toEqual(userEntityWithoutSensitiveData);
      expect(result.password).toBeUndefined();

      expect(usersRepository.findById).toBeCalledTimes(1);
      expect(usersRepository.findById).toBeCalledWith(
        userEntityWithoutSensitiveData.id,
      );
    });

    it('should throw an not found exception to inexistent users', async () => {
      jest.spyOn(usersRepository, 'findById').mockResolvedValueOnce(null);

      expect(
        usersService.getExistentById(userEntityWithoutSensitiveData.id),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw an exception when repository fail - findById', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      expect(
        usersService.sendAccountVerificationMailById,
      ).rejects.toThrowError();
    });
  });

  describe('create', () => {
    const createPayload: RegisterUserDto = {
      email: userEntity.email,
      name: userEntity.name,
      password: userEntity.password,
      picture: userEntity.picture,
      phone: userEntity.phone,
    };

    it('should create a user and return user data', async () => {
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValueOnce(null);

      //Act
      const response = await usersService.create(createPayload);

      expect(response).toEqual(userResponse);

      expect(usersRepository.findByEmail).toBeCalledTimes(1);
      expect(usersRepository.findByEmail).toBeCalledWith(userEntity.email);

      expect(usersRepository.create).toBeCalledTimes(1);
    });

    it('should throw an bad request exception when using existent email', async () => {
      expect(usersService.create(createPayload)).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findByEmail', async () => {
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockRejectedValueOnce(new Error());

      expect(usersService.create(createPayload)).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - create', async () => {
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'create').mockRejectedValueOnce(new Error());

      expect(usersService.create(createPayload)).rejects.toThrowError();
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      expect(usersService.delete(userEntity.id)).resolves.toBeUndefined();
    });

    it('should throw an exception when repository fail - deleteById', async () => {
      jest
        .spyOn(usersRepository, 'deleteById')
        .mockRejectedValueOnce(new Error());

      expect(usersService.delete).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      expect(
        usersService.sendAccountVerificationMailById,
      ).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should update user info successfully', async () => {
      const updatedUser: UserResponseDto = {
        emailStatus: userEntityWithoutSensitiveData.emailStatus,
        id: userEntityWithoutSensitiveData.id,
        name: 'Updated Name',
        picture: userEntityWithoutSensitiveData.picture,
        role: userEntityWithoutSensitiveData.role,
      };

      jest.spyOn(usersRepository, 'updateById').mockResolvedValueOnce({
        ...userEntityWithoutSensitiveData,
        ...updatedUser,
      });

      const result = await usersService.update(
        userEntityWithoutSensitiveData.id,
        {
          name: updatedUser.name,
        },
      );

      expect(result).toEqual(updatedUser);
    });

    it('should throw an exception when repository fail - updateById', async () => {
      jest
        .spyOn(usersRepository, 'updateById')
        .mockRejectedValueOnce(new Error());

      expect(usersService.update).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      expect(
        usersService.sendAccountVerificationMailById,
      ).rejects.toThrowError();
    });
  });

  describe('updatePassword', () => {
    it('should update user password successfully', async () => {
      const response = await usersService.updatePassword(
        userEntityWithoutSensitiveData.id,
        {
          oldPassword: userEntity.password,
          newPassword: 'SenhaTeste123@',
        },
      );

      expect(response).toEqual(userResponse);
    });

    it('should throw an exception when repository fail - updateById', async () => {
      jest
        .spyOn(usersRepository, 'updateById')
        .mockRejectedValueOnce(new Error());

      expect(usersService.updatePassword).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      expect(
        usersService.sendAccountVerificationMailById,
      ).rejects.toThrowError();
    });
  });

  describe('confirmAccountWithToken', () => {
    it('should confirm account with received token', async () => {
      jest.spyOn(usersRepository, 'findById').mockResolvedValue({
        ...userEntityData,
        emailStatus: 'PENDING',
      });
      jest.spyOn(usersRepository, 'updateById').mockResolvedValue({
        ...userEntityData,
        emailStatus: 'VERIFIED',
      });
      const token = jwtService.sign({
        id: userEntityWithoutSensitiveData.id,
        email: userEntityWithoutSensitiveData.email,
        createdAt: userEntityWithoutSensitiveData.createdAt,
      });

      const result = await usersService.verifyAccountWithToken(
        userEntityWithoutSensitiveData.id,
        token,
      );

      expect(result).toEqual({ ...userResponse, emailStatus: 'VERIFIED' });
    });

    it('should throw an exception when receiving wrong token', () => {
      jest.spyOn(usersRepository, 'findById').mockResolvedValue({
        ...userEntityData,
        emailStatus: 'PENDING',
      });
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      expect(
        usersService.verifyAccountWithToken(
          userEntityWithoutSensitiveData.id,
          'Wrong token',
        ),
      ).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - updateById', async () => {
      jest
        .spyOn(usersRepository, 'updateById')
        .mockRejectedValueOnce(new Error());

      expect(usersService.verifyAccountWithToken).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      expect(
        usersService.sendAccountVerificationMailById,
      ).rejects.toThrowError();
    });
  });

  describe('sendUserConfirmationMailById', () => {
    it('should send user confirmation mail successfully', async () => {
      const token = jwtService.sign({
        id: userEntityWithoutSensitiveData.id,
        email: userEntityWithoutSensitiveData.email,
        createdAt: userEntityWithoutSensitiveData.createdAt,
      });
      const url = `${mailService.projectUrl}/user/${userEntityWithoutSensitiveData.id}/verify/${token}`;
      const updatedUser: UserResponseDto = {
        ...userEntityWithoutSensitiveData,
        emailStatus: 'PENDING',
      };
      jest.spyOn(usersService, 'update').mockResolvedValueOnce(updatedUser);

      const result = await usersService.sendAccountVerificationMailById(
        userEntityWithoutSensitiveData.id,
      );

      expect(result).toEqual(updatedUser);
      expect(mailService.sendAccountVerificationMail).toBeCalledTimes(1);
      expect(mailService.sendAccountVerificationMail).toBeCalledWith({
        confirmationUrl: url,
        to: {
          email: userEntityWithoutSensitiveData.email,
          name: userEntityWithoutSensitiveData.name,
        },
      });
    });

    it('should throw an exception when repository fail - updateById', async () => {
      jest
        .spyOn(usersRepository, 'updateById')
        .mockRejectedValueOnce(new Error());

      expect(
        usersService.sendAccountVerificationMailById,
      ).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      expect(
        usersService.sendAccountVerificationMailById,
      ).rejects.toThrowError();
    });

    it('should throw an exception when mail service fail', async () => {
      jest
        .spyOn(mailService, 'sendAccountVerificationMail')
        .mockRejectedValueOnce(new Error());

      expect(
        usersService.sendAccountVerificationMailById,
      ).rejects.toThrowError();
    });
  });
});
