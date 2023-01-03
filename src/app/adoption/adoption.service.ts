import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdoptionRepository } from './adoption.repository';
import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { UpdateAdoptionDto } from './dto/update-adoption.dto';
import { AdoptionEntity } from './entities/adoption.entity';
import { AdoptionQueryParams } from './interfaces/DefaultQueryParams.interface';

@Injectable()
export class AdoptionService {
  constructor(private readonly adoptionRepository: AdoptionRepository) {}
  create(id: string, createAdoptionDto: CreateAdoptionDto) {
    return this.adoptionRepository.create(id, createAdoptionDto);
  }

  async getExistentById(id: string, hasVerifiedAccount = false) {
    const possibleAdoption = await this.findOne(id, hasVerifiedAccount);

    if (!possibleAdoption)
      throw new NotFoundException('This adoption does not exists.');

    return possibleAdoption;
  }

  async validateDonorWithIdAndReturnAdoption(
    id: string,
    possibleDonorId: string,
  ): Promise<Partial<AdoptionEntity>> {
    const adoption = await this.getExistentById(id, true);
    if (adoption.donorId !== possibleDonorId)
      throw new UnauthorizedException('This action is only to donor');

    return adoption;
  }

  async getAllFromUser(userId: string, params: AdoptionQueryParams) {
    return await this.adoptionRepository.findAllPerUser(userId, params);
  }

  async findAll(
    hasVerifiedAccount = false,
    defaultParams: AdoptionQueryParams,
  ) {
    const allAdoptions = await this.adoptionRepository.findAll(
      hasVerifiedAccount,
      defaultParams,
    );

    return allAdoptions;
  }

  findOne(id: string, canSeeDonorInfo = false) {
    return this.adoptionRepository.findById(id, canSeeDonorInfo);
  }

  update(id: string, updateAdoptionDto: UpdateAdoptionDto) {
    return this.adoptionRepository.updateById(id, updateAdoptionDto);
  }

  remove(id: string) {
    return this.adoptionRepository.deleteById(id);
  }
}
