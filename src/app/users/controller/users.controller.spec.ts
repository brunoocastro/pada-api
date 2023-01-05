import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import { UserResponseDto } from '../dto/response/user-response.dto';
import { UsersService } from '../service/users.service';
import { UsersController } from './users.controller';

const loggedUser: UserResponseDto = {
  emailStatus: 'UNVERIFIED',
  id: randomUUID(),
  name: 'Logged user',
  role: 'USER',
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockResolvedValue(loggedUser),
            getExistentById: jest.fn().mockResolvedValue(loggedUser),
            update: jest.fn(),
            updatePassword: jest.fn().mockResolvedValue(loggedUser),
            delete: jest.fn().mockResolvedValue(undefined),
            verifyAccountWithToken: jest
              .fn()
              .mockResolvedValue({ ...loggedUser, emailStatus: 'VERIFIED' }),
            sendAccountVerificationMailById: jest
              .fn()
              .mockResolvedValue({ ...loggedUser, emailStatus: 'PENDING' }),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user data', async () => {
      const result = await usersController.getUser(loggedUser.id);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(loggedUser);
      expect(usersService.getExistentById).toBeCalledWith(loggedUser.id);
      expect(usersService.getExistentById).toBeCalledTimes(1);
    });

    it('should throw an exception', () => {
      //Arrange
      jest.spyOn(usersService, 'findById').mockRejectedValueOnce(new Error());

      //Assert
      expect(usersController.getUser).rejects.toThrowError();
    });
  });

  describe('updateUser', () => {
    it('should update user and return updated data', async () => {
      const updatedName = 'Novo nome';
      const updatedUser = { ...loggedUser, name: updatedName };
      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await usersController.updateUser(loggedUser.id, {
        name: updatedName,
      });

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(updatedUser);
      expect(usersService.update).toBeCalledWith(loggedUser.id, {
        name: updatedName,
      });
      expect(usersService.update).toBeCalledTimes(1);
    });

    it('should throw an exception', () => {
      //Arrange
      jest.spyOn(usersService, 'update').mockRejectedValueOnce(new Error());

      //Assert
      expect(usersController.updateUser).rejects.toThrowError();
    });
  });

  describe('updateUserPassword', () => {
    it('should update user password and return updated data', async () => {
      const passwordPayload: UpdateUserPasswordDto = {
        newPassword: 'Teste',
        oldPassword: 'Teste2',
      };

      const result = await usersController.updateUserPassword(
        loggedUser.id,
        passwordPayload,
      );

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(loggedUser);
      expect(usersService.updatePassword).toBeCalledWith(
        loggedUser.id,
        passwordPayload,
      );
      expect(usersService.updatePassword).toBeCalledTimes(1);
    });

    it('should throw an exception', () => {
      //Arrange
      jest
        .spyOn(usersService, 'updatePassword')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(usersController.updateUserPassword).rejects.toThrowError();
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      await usersController.deleteUser(loggedUser.id);

      expect(usersService.delete).toBeCalledWith(loggedUser.id);
      expect(usersService.delete).toBeCalledTimes(1);
    });

    it('should throw an exception', () => {
      //Arrange
      jest.spyOn(usersService, 'delete').mockRejectedValueOnce(new Error());

      //Assert
      expect(usersController.deleteUser).rejects.toThrowError();
    });
  });

  describe('sendUserConfirmationMail', () => {
    it('should send successfully a confirmation account mail', async () => {
      //Act
      const result = await usersController.sendAccountVerificationMail(
        loggedUser.id,
      );

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user.emailStatus).toEqual('PENDING');

      expect(usersService.sendAccountVerificationMailById).toBeCalledTimes(1);
      expect(usersService.sendAccountVerificationMailById).toBeCalledWith(
        loggedUser.id,
      );
    });

    it('should throw an exception', () => {
      //Arrange
      jest
        .spyOn(usersService, 'sendAccountVerificationMailById')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(
        usersController.sendAccountVerificationMail,
      ).rejects.toThrowError();
    });
  });
  describe('confirmUserAccountByMail', () => {
    it('should confirm account with success', async () => {
      const fakeToken = randomUUID();

      //Act
      const result = await usersController.verifyAccountByMail(
        loggedUser.id,
        fakeToken,
      );

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user.emailStatus).toEqual('VERIFIED');
      expect(usersService.verifyAccountWithToken).toBeCalledTimes(1);
      expect(usersService.verifyAccountWithToken).toBeCalledWith(
        loggedUser.id,
        fakeToken,
      );
    });

    it('should throw an exception', () => {
      //Arrange
      jest
        .spyOn(usersService, 'verifyAccountWithToken')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(usersController.verifyAccountByMail).rejects.toThrowError();
    });
  });
});
