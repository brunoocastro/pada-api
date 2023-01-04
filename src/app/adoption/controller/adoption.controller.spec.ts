import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { UserEntity } from '../../users/entities/user.entity';
import { AdoptionController } from './adoption.controller';
import { AdoptionService } from '../service/adoption.service';
import { CreateAdoptionDto } from '../dto/create-adoption.dto';
import { AdoptionEntity } from '../entities/adoption.entity';
import { AdoptionQueryParams } from '../interfaces/DefaultQueryParams.interface';
import { DefaultAdoptionsResponse } from '../interfaces/DefaultAdoptionsResponse.interface';
import { AdoptionWithDonorEntity } from '../entities/adoptionWithDonor.entity';
import { UsersService } from '../../users/service/users.service';

const defaultParams: AdoptionQueryParams = {
  only_available: true,
  ordering: undefined,
  page: 1,
  page_size: 10,
  search: undefined,
};

const donor: UserEntity = new UserEntity({
  email: 'pada@yopmail.com',
  name: 'Pada User',
  emailStatus: 'UNVERIFIED',
  id: randomUUID(),
  password: 'SenhaTeste123@',
  phone: '55998765432',
  role: 'USER',
});

donor.password = undefined;

const donorWithVerifiedAccount: UserEntity = {
  ...donor,
  emailStatus: 'VERIFIED',
};

const createAdoptionData: CreateAdoptionDto = {
  gender: 'FEMALE',
  name: 'Kitty',
  species: 'Cat',
  breed: 'UNKNOWN',
  pictures: {},
};

const adoption: AdoptionEntity = new AdoptionEntity({
  ...createAdoptionData,
  donorId: donor.id,
});

const { donorId, ...adoptionWithoutDonor } = adoption;

const adoptionWithDonor: AdoptionWithDonorEntity = {
  ...adoption,
  donor,
};

const adoptionList = [adoptionWithoutDonor];
const adoptionCount = adoptionList.length;

const responseWithParams = <T>(
  params: AdoptionQueryParams,
  registers: Partial<T>[],
  total: number,
): DefaultAdoptionsResponse<T> => ({
  page: params.page,
  page_size: params.page_size,
  registers,
  total,
});

const findAllResponse = responseWithParams(
  defaultParams,
  adoptionList,
  adoptionCount,
);
const findAllWithDonorResponse = responseWithParams(
  defaultParams,
  [adoptionWithDonor],
  adoptionCount,
);

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
            findAll: jest.fn().mockResolvedValue(findAllResponse),
            getExistentById: jest.fn().mockResolvedValue(adoptionWithoutDonor),
            getAllFromDonor: jest.fn().mockResolvedValue(findAllResponse),
            validateDonorAndReturnAdoption: jest
              .fn()
              .mockResolvedValue(adoptionWithoutDonor),
            removeById: jest.fn().mockResolvedValue(undefined),
            updateById: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getExistentById: jest.fn(),
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
      const result = await adoptionController.createAdoption(
        createAdoptionData,
        donor,
      );

      expect(result).toEqual(adoption);
      expect(adoptionService.create).toBeCalledTimes(1);
      expect(adoptionService.create).toBeCalledWith(
        donor.id,
        createAdoptionData,
      );
    });

    it('should throw an exception', () => {
      jest.spyOn(adoptionService, 'create').mockRejectedValueOnce(new Error());

      expect(
        adoptionController.createAdoption(createAdoptionData, donor),
      ).rejects.toThrowError(Error);
    });
  });

  describe('getAllPublic', () => {
    it('should get all adoptions without donor info', async () => {
      const result = await adoptionController.getAllPublic(defaultParams);

      expect(result).toEqual(findAllResponse);
    });

    it('should throw an exception', () => {
      jest.spyOn(adoptionService, 'findAll').mockRejectedValueOnce(new Error());

      expect(adoptionController.getAllPublic).rejects.toThrowError(Error);
    });
  });

  describe('getAll', () => {
    it('should get all adoptions without donor info', async () => {
      const result = await adoptionController.getAll(donor, defaultParams);

      expect(result).toEqual(findAllResponse);
      expect(result.registers[0]).not.toHaveProperty('donor');
      expect(result.registers[0].donorId).toBeUndefined();
      expect(adoptionService.findAll).toBeCalledTimes(1);
      expect(adoptionService.findAll).toBeCalledWith(
        donor.emailStatus === 'VERIFIED',
        defaultParams,
      );
    });

    it('should get all adoptions with donor info', async () => {
      jest
        .spyOn(adoptionService, 'findAll')
        .mockResolvedValueOnce(findAllWithDonorResponse);

      const result = await adoptionController.getAll(
        donorWithVerifiedAccount,
        defaultParams,
      );

      expect(result).toEqual(findAllWithDonorResponse);
      expect(result.registers[0]).toHaveProperty('donor');
      expect(result.registers[0]).toHaveProperty('donorId');
      expect(adoptionService.findAll).toBeCalledTimes(1);
      expect(adoptionService.findAll).toBeCalledWith(
        donorWithVerifiedAccount.emailStatus === 'VERIFIED',
        defaultParams,
      );
    });

    it('should throw an exception', () => {
      jest.spyOn(adoptionService, 'findAll').mockRejectedValueOnce(new Error());

      expect(adoptionController.getAll).rejects.toThrowError(Error);
    });
  });

  describe('findOne', () => {
    it('should get a adoption by id without donor info', async () => {
      const result = await adoptionController.findOne(adoption.id, donor);

      expect(result).toEqual(adoptionWithoutDonor);
      expect(result).not.toHaveProperty('donor');
      expect(result.donorId).toBeUndefined();
      expect(adoptionService.getExistentById).toBeCalledTimes(1);
      expect(adoptionService.getExistentById).toBeCalledWith(
        adoption.id,
        donor.emailStatus === 'VERIFIED',
      );
    });

    it('should get a adoption by id with donor info', async () => {
      jest
        .spyOn(adoptionService, 'getExistentById')
        .mockResolvedValueOnce(adoptionWithDonor);
      const result = await adoptionController.findOne(adoption.id, donor);

      expect(result).toEqual(adoptionWithDonor);
      expect(result).toHaveProperty('donor');
      expect(result).toHaveProperty('donorId');
      expect(adoptionService.getExistentById).toBeCalledTimes(1);
      expect(adoptionService.getExistentById).toBeCalledWith(
        adoption.id,
        donor.emailStatus === 'VERIFIED',
      );
    });

    it('should throw an exception', () => {
      jest
        .spyOn(adoptionService, 'getExistentById')
        .mockRejectedValueOnce(new Error());

      expect(adoptionController.findOne).rejects.toThrowError(Error);
    });
  });

  describe('findDonorAdoptions', () => {
    it('should get all adoptions for donor with id', async () => {
      const result = await adoptionController.findDonorAdoptions(
        donor.id,
        defaultParams,
      );
      expect(result).toEqual(findAllResponse);
      expect(usersService.getExistentById).toBeCalledTimes(1);
      expect(usersService.getExistentById).toBeCalledWith(donor.id);
      expect(adoptionService.getAllFromDonor).toBeCalledTimes(1);
      expect(adoptionService.getAllFromDonor).toBeCalledWith(
        donor.id,
        defaultParams,
      );
    });
    it('should throw an exception', () => {
      jest
        .spyOn(usersService, 'getExistentById')
        .mockRejectedValueOnce(new Error());
      expect(adoptionController.findDonorAdoptions).rejects.toThrowError(Error);
    });
    it('should throw an exception', () => {
      jest
        .spyOn(adoptionService, 'getAllFromDonor')
        .mockRejectedValueOnce(new Error());
      expect(adoptionController.findDonorAdoptions).rejects.toThrowError(Error);
    });
  });

  describe('update', () => {
    it('should update a adoption by id', async () => {
      const updatedAdoption: AdoptionEntity = {
        ...adoption,
        name: 'Updated Adoption',
      };

      jest
        .spyOn(adoptionService, 'updateById')
        .mockResolvedValue(updatedAdoption);

      const result = await adoptionController.update(
        adoption.id,
        {
          name: updatedAdoption.name,
        },
        donor,
      );

      expect(result).toEqual(updatedAdoption);
      expect(adoptionService.updateById).toBeCalledTimes(1);
      expect(adoptionService.updateById).toBeCalledWith(adoption.id, {
        name: updatedAdoption.name,
      });
    });

    it('should throw an exception', () => {
      jest
        .spyOn(adoptionService, 'updateById')
        .mockRejectedValueOnce(new Error());

      expect(adoptionController.update).rejects.toThrowError(Error);
    });
  });

  describe('remove', () => {
    it('should remove a adoption by id', async () => {
      const result = await adoptionController.remove(adoption.id, donor);
      expect(result).toBeUndefined();
      expect(adoptionService.removeById).toBeCalledTimes(1);
      expect(adoptionService.removeById).toBeCalledWith(adoption.id);
    });

    it('should throw an exception', () => {
      jest
        .spyOn(adoptionService, 'removeById')
        .mockRejectedValueOnce(new Error());

      expect(adoptionController.remove).rejects.toThrowError(Error);
    });
  });
});
