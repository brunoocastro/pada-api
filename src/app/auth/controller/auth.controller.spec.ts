import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { RegisterUserDto } from '../dto/register.dto';

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
  picture: newUserPayloadDto.picture,
  role: 'USER',
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return basic user data', async () => {
      // Act
      const result = await authController.register(newUserPayloadDto);

      //Assert
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(newUserResponseDto);
      expect(result.user).toBeInstanceOf(Object);
      expect(typeof result.message).toEqual('string');
      expect(authService.registerUser).toBeCalledTimes(1);
      expect(authService.registerUser).toBeCalledWith(newUserPayloadDto);
    });

    it('should throw an exception', () => {
      //Arrange
      jest
        .spyOn(authService, 'registerUser')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(authController.register).rejects.toThrowError();
    });
  });

  describe('login with decorators', () => {
    it.todo('should return logged user with token');
  });
});
