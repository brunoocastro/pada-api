import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { UserResponseDto } from '../../users/dto/response/user-response.dto';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { RegisterUserDto } from '../dto/register.dto';
import { LocalStrategy } from '../strategies/local.strategy';

const fakeToken = randomUUID();

const newUserPayloadDto: RegisterUserDto = {
  email: 'tonelive@yopmail.com',
  name: 'Tonelive',
  password: 'Senha123@',
  picture: 'https://thispersondoesnotexist.com/',
  phone: '55998765432',
};

const newUserResponseDto: UserResponseDto = {
  emailStatus: 'UNVERIFIED',
  id: randomUUID(),
  name: newUserPayloadDto.name,
  role: 'USER',
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let localStrategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerUser: jest.fn().mockResolvedValue(newUserResponseDto),
          },
        },
        {
          provide: LocalStrategy,
          useValue: {
            validate: jest
              .fn()
              .mockResolvedValue({ token: fakeToken, ...newUserResponseDto }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    localStrategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
    expect(localStrategy).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return basic user data', async () => {
      const result = await authController.register(newUserPayloadDto);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(newUserResponseDto);
      expect(result.user).toBeInstanceOf(Object);
      expect(typeof result.message).toEqual('string');
      expect(authService.registerUser).toBeCalledTimes(1);
      expect(authService.registerUser).toBeCalledWith(newUserPayloadDto);
    });

    it('should throw an exception', () => {
      jest
        .spyOn(authService, 'registerUser')
        .mockRejectedValueOnce(new Error());

      expect(authController.register).rejects.toThrowError();
    });
  });

  describe('login with decorators', () => {
    it('should return logged user with token', async () => {
      const result = await authController.login({
        email: newUserPayloadDto.email,
        password: newUserPayloadDto.password,
      });

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({ token: fakeToken, ...newUserResponseDto });
    });

    it('should throw an exception', () => {
      jest.spyOn(localStrategy, 'validate').mockRejectedValueOnce(new Error());

      expect(authController.login).rejects.toThrowError();
    });
  });
});
