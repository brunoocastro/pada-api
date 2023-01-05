import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import { cryptoHelper } from '../../../helpers/crypto.helper';
import { UserResponseDto } from '../../users/dto/response/user-response.dto';
import { UsersRepository } from '../../users/repository/users.repository';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../dto/register.dto';
import { UsersService } from '../../users/service/users.service';
import { UserEntity } from '../../users/entities/user.entity';

const userEmail = 'tonelive@yopmail.com';

const userRawData: UserEntity = {
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

const userWithSensitiveData = new UserEntity(userRawData);

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
            sendAccountVerificationMailById: jest
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
      const { token, ...resultWithoutToken } =
        await authService.validateUserLogin(
          userEmail,
          userWithSensitiveData.password,
        );

      expect(resultWithoutToken).toEqual(userData);
      expect(token).toEqual(jwtService.sign(resultWithoutToken));
    });

    it('should return unauthorized exception by sending wrong password', async () => {
      expect(() =>
        authService.validateUserLogin(userEmail, 'WrongPassword'),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should return unauthorized exception by sending wrong email', async () => {
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValueOnce(null);

      expect(() =>
        authService.validateUserLogin(
          'WrongEmail',
          userWithSensitiveData.password,
        ),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('registerUser', () => {
    const registerPayload: RegisterUserDto = {
      email: userEmail,
      name: userData.name,
      picture: 'thispersondoesnotexists.com',
      password: userWithSensitiveData.password,
      phone: '55996279889',
    };

    it('should register user, send confirmation mail and return user data', async () => {
      const response = await authService.registerUser(registerPayload);

      expect(response).toEqual({ ...userData, emailStatus: 'PENDING' });
      expect(response).not.toHaveProperty('password');
      expect(usersService.create).toBeCalledWith(registerPayload);
      expect(usersService.create).toBeCalledTimes(1);
      expect(usersService.sendAccountVerificationMailById).toBeCalledWith(
        response.id,
      );
      expect(usersService.sendAccountVerificationMailById).toBeCalledTimes(1);
      expect(response.emailStatus).toEqual('PENDING');
    });

    it('should throw bad request exception by service error', async () => {
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValueOnce(new BadRequestException());

      expect(authService.registerUser(registerPayload)).rejects.toThrowError(
        new BadRequestException(),
      );
    });
  });
});
