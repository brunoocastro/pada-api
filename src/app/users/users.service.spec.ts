import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import { cryptoHelper } from '../../helpers/crypto.helper';
import { MailService } from '../mail/mail.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UserWithSensitiveDataDto } from './dto/user-with-sensitive-data.dto';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const userEntityData: UserEntity = {
  id: randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
  email: 'tonelive@yopmail.com',
  emailStatus: 'UNVERIFIED',
  name: 'tonelive',
  password: 'SenhaSecreta123@',
  picture: 'thispersondoesnotexists.com',
  role: 'USER',
};

const userEntity: UserEntity = plainToInstance(UserEntity, userEntityData, {
  excludeExtraneousValues: true,
});

const userEntityWithSensitiveData = plainToInstance(
  UserWithSensitiveDataDto,
  userEntityData,
);

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
            findById: jest.fn().mockResolvedValue({
              ...userEntityWithSensitiveData,
              password: cryptoHelper.hashPassword(
                userEntityWithSensitiveData.password,
              ),
            }),
            findByEmail: jest
              .fn()
              .mockResolvedValue(userEntityWithSensitiveData),
            create: jest.fn().mockResolvedValue(userEntityWithSensitiveData),
            updateById: jest
              .fn()
              .mockResolvedValue(userEntityWithSensitiveData),
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
            sendConfirmAccountMail: jest.fn(),
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
      // Act
      const result = await usersService.findById(userEntity.id);

      // Assert
      expect(result).toEqual(userEntity);
      expect(result.password).toBeUndefined();

      expect(usersRepository.findById).toBeCalledTimes(1);
      expect(usersRepository.findById).toBeCalledWith(userEntity.id);
    });

    it('should throw an exception when repository fail - findById', () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.findById).rejects.toThrowError();
    });
  });

  describe('findByEmail', () => {
    it('should return a user entity without sensitive data successfully', async () => {
      // Act
      const result = await usersService.findByEmail(userEntity.email);

      // Assert
      expect(result).toEqual(userEntity);
      expect(result.password).toBeUndefined();

      expect(usersRepository.findByEmail).toBeCalledTimes(1);
      expect(usersRepository.findByEmail).toBeCalledWith(userEntity.email);
    });

    it('should throw an exception when repository fail - findByEmail', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.findByEmail).rejects.toThrowError();
    });
  });

  describe('getExistentById', () => {
    it('should return an existent user', async () => {
      // Act
      const result = await usersService.getExistentById(userEntity.id);

      // Assert
      expect(result).toEqual(userEntity);
      expect(result.password).toBeUndefined();

      expect(usersRepository.findById).toBeCalledTimes(1);
      expect(usersRepository.findById).toBeCalledWith(userEntity.id);
    });

    it('should throw an not found exception to inexistent users', async () => {
      // Act
      jest.spyOn(usersRepository, 'findById').mockResolvedValueOnce(null);

      // Assert
      expect(usersService.getExistentById(userEntity.id)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw an exception when repository fail - findById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.sendUserConfirmationMailById).rejects.toThrowError();
    });
  });

  describe('create', () => {
    const createPayload = {
      email: userEntityWithSensitiveData.email,
      name: userEntityWithSensitiveData.name,
      password: userEntityWithSensitiveData.password,
      picture: userEntityWithSensitiveData.password,
    };
    it('should create a user and return user data', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValueOnce(null);

      //Act
      const response = await usersService.create(createPayload);

      // Assert
      expect(response).toEqual(userResponse);

      expect(usersRepository.findByEmail).toBeCalledTimes(1);
      expect(usersRepository.findByEmail).toBeCalledWith(
        userEntityWithSensitiveData.email,
      );

      expect(usersRepository.create).toBeCalledTimes(1);
    });

    it('should throw an bad request exception when using existent email', async () => {
      // Assert
      expect(usersService.create(createPayload)).rejects.toThrowError(
        BadRequestException,
      );
    });

    it('should throw an exception when repository fail - findByEmail', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.create).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - create', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(usersRepository, 'create').mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.create).rejects.toThrowError();
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      // Assert
      expect(
        usersService.delete(userEntityWithSensitiveData.id),
      ).resolves.toBeUndefined();
    });

    it('should throw an exception when repository fail - deleteById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'deleteById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.delete).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.sendUserConfirmationMailById).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should update user info successfully', async () => {
      // Arrange
      const updatedUser: UserResponseDto = {
        emailStatus: userEntity.emailStatus,
        id: userEntity.id,
        name: 'Updated Name',
        picture: userEntity.picture,
        role: userEntity.role,
      };

      jest
        .spyOn(usersRepository, 'updateById')
        .mockResolvedValueOnce({ ...userEntity, ...updatedUser });

      // Act
      const result = await usersService.update(userEntity.id, {
        name: updatedUser.name,
      });
      // Assert
      expect(result).toEqual(updatedUser);
    });

    it('should throw an exception when repository fail - updateById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'updateById')
        .mockRejectedValueOnce(new Error());
      // Assert
      expect(usersService.update).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.sendUserConfirmationMailById).rejects.toThrowError();
    });
  });

  describe('updatePassword', () => {
    it('should update user password successfully', async () => {
      // Act
      const response = await usersService.updatePassword(userEntity.id, {
        oldPassword: userEntityWithSensitiveData.password,
        newPassword: 'SenhaTeste123@',
      });

      // Assert
      expect(response).toEqual(userResponse);
    });

    it('should throw an exception when repository fail - updateById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'updateById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.updatePassword).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.sendUserConfirmationMailById).rejects.toThrowError();
    });
  });

  describe('confirmAccountWithToken', () => {
    it('should confirm account with received token', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'findById').mockResolvedValue({
        ...userEntityData,
        emailStatus: 'PENDING',
      });
      jest.spyOn(usersRepository, 'updateById').mockResolvedValue({
        ...userEntityData,
        emailStatus: 'VERIFIED',
      });
      const token = jwtService.sign({
        id: userEntity.id,
        email: userEntity.email,
        createdAt: userEntity.createdAt,
      });

      // Act
      const result = await usersService.confirmAccountWithToken(
        userEntity.id,
        token,
      );

      expect(result).toEqual({ ...userResponse, emailStatus: 'VERIFIED' });
    });

    it('should throw an exception when receiving wrong token', () => {
      // Arrange
      jest.spyOn(usersRepository, 'findById').mockResolvedValue({
        ...userEntityData,
        emailStatus: 'PENDING',
      });
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(
        usersService.confirmAccountWithToken(userEntity.id, 'Wrong token'),
      ).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - updateById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'updateById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.confirmAccountWithToken).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.sendUserConfirmationMailById).rejects.toThrowError();
    });
  });

  describe('sendUserConfirmationMailById', () => {
    it('should send user confirmation mail successfully', async () => {
      // Arrange
      const token = jwtService.sign({
        id: userEntity.id,
        email: userEntity.email,
        createdAt: userEntity.createdAt,
      });
      const url = `${mailService.projectUrl}/user/${userEntity.id}/mail/confirm/${token}`;
      const updatedUser: UserResponseDto = {
        ...userEntity,
        emailStatus: 'PENDING',
      };
      jest.spyOn(usersService, 'update').mockResolvedValueOnce(updatedUser);

      // Act
      const result = await usersService.sendUserConfirmationMailById(
        userEntity.id,
      );

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mailService.sendConfirmAccountMail).toBeCalledTimes(1);
      expect(mailService.sendConfirmAccountMail).toBeCalledWith({
        confirmationUrl: url,
        to: { email: userEntity.email, name: userEntity.name },
      });
    });

    it('should throw an exception when repository fail - updateById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'updateById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.sendUserConfirmationMailById).rejects.toThrowError();
    });

    it('should throw an exception when repository fail - findById', async () => {
      // Arrange
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.sendUserConfirmationMailById).rejects.toThrowError();
    });

    it('should throw an exception when mail service fail', async () => {
      // Arrange
      jest
        .spyOn(mailService, 'sendConfirmAccountMail')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(usersService.sendUserConfirmationMailById).rejects.toThrowError();
    });
  });
});
