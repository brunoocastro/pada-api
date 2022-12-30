import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const loggedUser: UserResponseDto = {
  emailStatus: 'UNVERIFIED',
  id: randomUUID(),
  name: 'Logged user',
  picture: 'https://thispersondoesnotexist.com/',
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
            update: jest.fn(),
            updatePassword: jest.fn().mockResolvedValue(loggedUser),
            delete: jest.fn().mockResolvedValue(undefined),
            confirmAccountWithToken: jest
              .fn()
              .mockResolvedValue({ ...loggedUser, emailStatus: 'VERIFIED' }),
            sendUserConfirmationMailById: jest
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
      // Act
      const result = await usersController.getUser(loggedUser.id);

      // Assert
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(loggedUser);
      expect(usersService.findById).toBeCalledWith(loggedUser.id);
      expect(usersService.findById).toBeCalledTimes(1);
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
      // Arrange
      const updatedName = 'Novo nome';
      const updatedUser = { ...loggedUser, name: updatedName };
      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      // Act
      const result = await usersController.updateUser(loggedUser.id, {
        name: updatedName,
      });

      // Assert
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
      // Arrange
      const passwordPayload: UpdateUserPasswordDto = {
        newPassword: 'Teste',
        oldPassword: 'Teste2',
      };
      // Act
      const result = await usersController.updateUserPassword(
        loggedUser.id,
        passwordPayload,
      );

      // Assert
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
      // Act
      const result = await usersController.deleteUser(loggedUser.id);

      // Assert
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('id');
      expect(result.id).toEqual(loggedUser.id);
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
      const result = await usersController.sendAccountConfirmationMail(
        loggedUser.id,
      );

      // Assert
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user.emailStatus).toEqual('PENDING');

      expect(usersService.sendUserConfirmationMailById).toBeCalledTimes(1);
      expect(usersService.sendUserConfirmationMailById).toBeCalledWith(
        loggedUser.id,
      );
    });

    it('should throw an exception', () => {
      //Arrange
      jest
        .spyOn(usersService, 'sendUserConfirmationMailById')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(
        usersController.sendAccountConfirmationMail,
      ).rejects.toThrowError();
    });
  });
  describe('confirmUserAccountByMail', () => {
    it('should confirm account with success', async () => {
      // Arrange
      const fakeToken = randomUUID();

      //Act
      const result = await usersController.confirmAccountByMail(
        loggedUser.id,
        fakeToken,
      );

      // Assert
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.user.emailStatus).toEqual('VERIFIED');
      expect(usersService.confirmAccountWithToken).toBeCalledTimes(1);
      expect(usersService.confirmAccountWithToken).toBeCalledWith(
        loggedUser.id,
        fakeToken,
      );
    });

    it('should throw an exception', () => {
      //Arrange
      jest
        .spyOn(usersService, 'confirmAccountWithToken')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(usersController.confirmAccountByMail).rejects.toThrowError();
    });
  });
});
