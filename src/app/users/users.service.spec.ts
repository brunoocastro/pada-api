import { NotFoundException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { UserWithSensitiveDataDto } from './dto/user-with-sensitive-data.dto';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const userEntityData = {
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

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepository;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue(userEntityWithSensitiveData),
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
          useValue: new JwtService({ privateKey: 'TestPrivateKey' }),
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
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(usersRepository).toBeDefined();
    expect(mailService).toBeDefined();
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

    it('should throw an exception', () => {
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

    it('should throw an exception', async () => {
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
  });

  describe('create', () => {});
  describe('delete', () => {});
  describe('update', () => {});
  describe('updatePassword', () => {});
  describe('confirmAccountWithToken', () => {});
  describe('sendUserConfirmationMailById', () => {});
});
