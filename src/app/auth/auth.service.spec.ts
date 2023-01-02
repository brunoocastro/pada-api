import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import { cryptoHelper } from '../../helpers/crypto.helper';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserWithSensitiveDataDto } from '../users/dto/user-with-sensitive-data.dto';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';

const userEmail = 'tonelive@yopmail.com';

const userRawData = {
  emailStatus: 'UNVERIFIED',
  id: randomUUID(),
  name: 'Tonelive',
  picture: 'https://thispersondoesnotexist.com/',
  role: 'USER',
  password: 'Senha123@',
  createdAt: new Date(),
  updatedAt: new Date(),
  email: 'tonelive@yopmail.com',
};

const userWithSensitiveData: UserWithSensitiveDataDto = plainToInstance(
  UserWithSensitiveDataDto,
  userRawData,
  { excludeExtraneousValues: true },
);

const userData: UserResponseDto = plainToInstance(
  UserResponseDto,
  userRawData,
  { excludeExtraneousValues: true },
);

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: new JwtService({ privateKey: 'TestPrivateKey' }),
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(userData),
            sendUserConfirmationMailById: jest
              .fn()
              .mockResolvedValue({ ...userData, emailStatus: 'PENDING' }),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue({
              ...userWithSensitiveData,
              password: cryptoHelper.hashPassword(
                userWithSensitiveData.password,
              ),
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  describe('validateUserLogin', () => {
    it('should validate user login and return user data with token', async () => {
      // Act
      const { token, ...resultWithoutToken } =
        await authService.validateUserLogin(
          userEmail,
          userWithSensitiveData.password,
        );

      console.log({
        resultWithoutToken,
        userData,
        userRawData,
        userWithSensitiveData,
      });

      // Assert
      expect(resultWithoutToken).toEqual(userData);
      expect(token).toEqual(jwtService.sign(resultWithoutToken));
    });

    it('should return unauthorized exception by sending wrong password', async () => {
      // Assert
      expect(() =>
        authService.validateUserLogin(userEmail, 'WrongPassword'),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should return unauthorized exception by sending wrong email', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValueOnce(null);

      // Assert
      expect(() =>
        authService.validateUserLogin(
          'WrongEmail',
          userWithSensitiveData.password,
        ),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('registerUser', () => {
    // Arrange
    const registerPayload: RegisterUserDto = {
      email: userEmail,
      name: userData.name,
      picture: userData.picture,
      password: userWithSensitiveData.password,
    };

    it('should register user, send confirmation mail and return user data', async () => {
      // Act
      const response = await authService.registerUser(registerPayload);
      console.log({ response });

      // Assert
      expect(response).toEqual({ ...userData, emailStatus: 'PENDING' });
      expect(response).not.toHaveProperty('password');
      expect(usersService.create).toBeCalledWith(registerPayload);
      expect(usersService.create).toBeCalledTimes(1);
      expect(usersService.sendUserConfirmationMailById).toBeCalledWith(
        response.id,
      );
      expect(usersService.sendUserConfirmationMailById).toBeCalledTimes(1);
      expect(response.emailStatus).toEqual('PENDING');
    });

    it('should throw bad request exception by service error', async () => {
      // Arrange
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValueOnce(new BadRequestException());

      //Assert
      expect(
        async () => await authService.registerUser(registerPayload),
      ).rejects.toThrowError(BadRequestException);
    });
  });
});
