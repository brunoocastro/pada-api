import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdoptionRepository } from './../repository/adoption.repository';
import { CreateAdoptionDto } from './../dto/create-adoption.dto';
import { UpdateAdoptionDto } from './../dto/update-adoption.dto';
import { AdoptionEntity } from './../entities/adoption.entity';
import { AdoptionQueryParams } from './../interfaces/DefaultQueryParams.interface';
import { AdoptionWithDonorEntity } from '../entities/adoptionWithDonor.entity';
import { ManyAdoptionsResponseDto } from '../dto/response/default-adoption-response.dto';

@Injectable()
export class AdoptionService {
  constructor(private readonly adoptionRepository: AdoptionRepository) {}

  async create(donorId: string, createAdoptionDto: CreateAdoptionDto) {
    return await this.adoptionRepository.create(donorId, createAdoptionDto);
  }

  async updateById(id: string, updateAdoptionDto: UpdateAdoptionDto) {
    await this.getExistentById(id);
    return await this.adoptionRepository.updateById(id, updateAdoptionDto);
  }

  async removeById(id: string) {
    await this.getExistentById(id);
    return await this.adoptionRepository.deleteById(id);
  }

  async findOneById(id: string, canSeeDonorInfo = false) {
    return await this.adoptionRepository.findById(id, canSeeDonorInfo);
  }

  async getExistentById(id: string, hasVerifiedAccount = false) {
    const possibleAdoption = await this.findOneById(id, hasVerifiedAccount);

    if (!possibleAdoption)
      throw new NotFoundException('This adoption does not exists.');

    return possibleAdoption;
  }

  async validateDonorAndReturnAdoption(
    adoptionId: string,
    possibleDonorId: string,
  ): Promise<Partial<AdoptionEntity>> {
    const adoption = await this.getExistentById(adoptionId, true);
    if (adoption.donorId !== possibleDonorId)
      throw new UnauthorizedException('This action is only to donor');

    return adoption;
  }

  async getAllFromDonor(
    donorId: string,
    params: AdoptionQueryParams,
  ): Promise<ManyAdoptionsResponseDto<AdoptionEntity>> {
    const registers = await this.adoptionRepository.findAllPerUser(
      donorId,
      params,
    );

    const total = await this.adoptionRepository.count(params, donorId);

    return {
      page: params.page,
      page_size: params.page_size,
      total,
      registers,
    };
  }

  async findAll(
    hasVerifiedAccount = false,
    params: AdoptionQueryParams,
  ): Promise<ManyAdoptionsResponseDto<AdoptionWithDonorEntity>> {
    const registers = await this.adoptionRepository.findAll(
      hasVerifiedAccount,
      params,
    );

    const total = await this.adoptionRepository.count(params);

    return {
      page: params.page,
      page_size: params.page_size,
      total,
      registers,
    };
  }
}
