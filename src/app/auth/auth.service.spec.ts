import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { cryptoHelper } from '../../helpers/crypto.helper';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserWithSensitiveDataDto } from '../users/dto/user-with-sensitive-data.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import 'reflect-metadata';
import { RegisterUserDto } from './dto/register.dto';
import { UserEntity } from '../users/entities/user.entity';

const userEmail = 'tonelive@yopmail.com';

const userData: UserResponseDto = {
  emailStatus: 'UNVERIFIED',
  id: randomUUID(),
  name: 'Tonelive',
  picture: 'https://thispersondoesnotexist.com/',
};

const userWithSensitiveData: UserWithSensitiveDataDto = {
  ...userData,
  password: 'Senha123@',
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

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
            findByEmailWithSensitiveData: jest.fn().mockResolvedValue({
              ...userWithSensitiveData,
              password: cryptoHelper.hashPassword(
                userWithSensitiveData.password,
              ),
            }),
            create: jest.fn().mockResolvedValue(userData),
            sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('validateUserLogin', () => {
    it('should validate user login and user data with token', async () => {
      // Act
      const { token, ...resultWithoutToken } =
        await authService.validateUserLogin(
          userEmail,
          userWithSensitiveData.password,
        );

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
      jest
        .spyOn(usersService, 'findByEmailWithSensitiveData')
        .mockResolvedValue(null);

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

      // Assert
      expect(response).toEqual(userData);
      expect(response).not.toHaveProperty('password');
      expect(usersService.create).toBeCalledWith(registerPayload);
      expect(usersService.create).toBeCalledTimes(1);
      expect(usersService.sendConfirmationEmail).toBeCalledWith(response.id);
      expect(usersService.sendConfirmationEmail).toBeCalledTimes(1);
    });

    it('should throw bad request exception by service error', async () => {
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
