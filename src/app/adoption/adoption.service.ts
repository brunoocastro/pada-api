import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdoptionRepository } from './adoption.repository';
import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { UpdateAdoptionDto } from './dto/update-adoption.dto';
import { AdoptionQueryParams } from './interfaces/DefaultQueryParams.interface';

@Injectable()
export class AdoptionService {
  constructor(private readonly adoptionRepository: AdoptionRepository) {}
  create(id: string, createAdoptionDto: CreateAdoptionDto) {
    return this.adoptionRepository.create(id, createAdoptionDto);
  }

  async getExistentById(id: string) {
    const possibleAdoption = await this.findOne(id, true);

    if (!possibleAdoption)
      throw new NotFoundException('This adoption does not exists.');

    return possibleAdoption;
  }

  async validateDonorWithId(
    id: string,
    possibleDonorId: string,
  ): Promise<void> {
    const { donorId } = await this.getExistentById(id);
    if (donorId !== possibleDonorId)
      throw new UnauthorizedException('This action is only to donor');
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
