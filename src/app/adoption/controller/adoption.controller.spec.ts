import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { UserEntity } from '../../users/entities/user.entity';
import { AdoptionController } from './adoption.controller';
import { AdoptionService } from '../service/adoption.service';
import { CreateAdoptionDto } from '../dto/create-adoption.dto';
import { AdoptionEntity } from '../entities/adoption.entity';
import { UsersService } from '../../users/service/users.service';

const donor: UserEntity = new UserEntity({
  email: 'pada@yopmail.com',
  name: 'Pada User',
  emailStatus: 'UNVERIFIED',
  id: randomUUID(),
  password: 'SenhaTeste123@',
  phone: '55998765432',
});

const createAdoptionData: CreateAdoptionDto = {
  gender: 'FEMALE',
  name: 'Kitty',
  species: 'Cat',
  breed: 'UNKNOWN',
  pictures: {},
};

const adoption: AdoptionEntity = new AdoptionEntity(createAdoptionData);

describe('AdoptionController', () => {
  let adoptionController: AdoptionController;
  let adoptionService: AdoptionService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdoptionController],
      providers: [
        {
          provide: AdoptionService,
          useValue: {
            create: jest.fn().mockResolvedValue(adoption),
            findAll: jest.fn(),
            getExistentById: jest.fn(),
            getAllFromUser: jest.fn(),
            validateDonorWithIdAndReturnAdoption: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getExistentById: jest.fn().mockResolvedValue(donor),
          },
        },
      ],
    }).compile();

    adoptionController = module.get<AdoptionController>(AdoptionController);
    adoptionService = module.get<AdoptionService>(AdoptionService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(adoptionController).toBeDefined();
    expect(adoptionService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('createAdoption', () => {
    it('should create a new adoption', async () => {
      // Act
      const result = await adoptionController.createAdoption(
        createAdoptionData,
        donor,
      );

      // Assert
      expect(result).toEqual(adoption);
      expect(adoptionService.create).toBeCalledTimes(1);
      expect(adoptionService.create).toBeCalledWith(
        donor.id,
        createAdoptionData,
      );
    });

    it('should throw an exception', () => {
      // Assert
      jest.spyOn(adoptionService, 'create').mockRejectedValueOnce(new Error());

      expect(
        adoptionController.createAdoption(createAdoptionData, donor),
      ).rejects.toThrowError();
    });
  });

  describe('getAllPublic', () => {
    it.todo('should get all adoptions without donor info');
  });
  describe('getAll', () => {
    it.todo('should get all adoptions with donor info');
  });
  describe('findOneById', () => {
    it.todo('should get a adoption by id');
  });
  describe('findDonorAdoptions', () => {
    it.todo('should get all adoptions for donor with id');
  });
  describe('updateById', () => {
    it.todo('should update a adoption by id');
  });
  describe('removeById', () => {
    it.todo('should remove a adoption by id');
  });
  describe('uploadAdoptionPicture', () => {
    it.todo('should upload a picture to adoption');
  });
  describe('getAdoptionPicture', () => {
    it.todo('should get a adoption uploaded picture');
  });
});
