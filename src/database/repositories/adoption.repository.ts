import { Injectable } from '@nestjs/common';
import { AdoptionRepository } from '../../app/adoption/repository/adoption.repository';
import { AdoptionEntity } from '../../app/adoption/entities/adoption.entity';
import { AdoptionQueryParams } from '../../app/adoption/interfaces/DefaultQueryParams.interface';
import { databaseHelper } from '../../helpers/database.helper';
import { PrismaService } from '../prisma.service';
import { AdoptionWithDonorEntity } from '../../app/adoption/entities/adoptionWithDonor.entity';
import { CreateAdoptionDto } from '../../app/adoption/dto/create-adoption.dto';

@Injectable()
export class AdoptionPrismaRepository implements AdoptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async count(params: AdoptionQueryParams, userId?: string): Promise<number> {
    const baseParams = databaseHelper.getFindManyParams(params);

    const paramsWithUserId = {
      ...baseParams,
      where: {
        ...baseParams.where,
        donorId: userId ?? {},
      },
    };

    const total = await this.prismaService.adoption.count(paramsWithUserId);

    return total;
  }

  async findAllPerUser(
    userId: string,
    params: AdoptionQueryParams,
  ): Promise<AdoptionEntity[]> {
    const baseParams = databaseHelper.getFindManyParams(params);

    const paramsWithUserId = {
      ...baseParams,
      where: {
        ...baseParams.where,
        donorId: userId,
      },
    };

    const userAdoptions = await this.prismaService.adoption.findMany(
      paramsWithUserId,
    );

    return userAdoptions;
  }

  async findAll(
    canSeeDonorInfo = false,
    params: AdoptionQueryParams,
  ): Promise<AdoptionWithDonorEntity[]> {
    const baseParams = databaseHelper.getFindManyParams(params);

    const selectParams = databaseHelper.getSelectorParams(canSeeDonorInfo);

    const publicAdoptions = await this.prismaService.adoption.findMany({
      ...baseParams,
      ...selectParams,
    });

    return publicAdoptions;
  }

  async findById(
    id: string,
    canSeeDonorInfo = false,
  ): Promise<Partial<AdoptionEntity>> {
    const selectParams = databaseHelper.getSelectorParams(canSeeDonorInfo);
    return await this.prismaService.adoption.findUnique({
      where: { id },
      ...selectParams,
    });
  }

  async create(
    donorId: string,
    adoption: CreateAdoptionDto,
  ): Promise<AdoptionEntity> {
    return await this.prismaService.adoption.create({
      data: { ...adoption, donorId },
    });
  }

  async updateById(
    id: string,
    updatedAdoption: AdoptionEntity,
  ): Promise<AdoptionEntity> {
    return await this.prismaService.adoption.update({
      where: { id },
      data: updatedAdoption,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prismaService.adoption.delete({
      where: { id },
    });
  }
}
