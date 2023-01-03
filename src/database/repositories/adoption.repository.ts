import { Injectable } from '@nestjs/common';
import { AdoptionRepository } from '../../app/adoption/adoption.repository';
import { AdoptionEntity } from '../../app/adoption/entities/adoption.entity';
import { DefaultAdoptionsResponse } from '../../app/adoption/interfaces/DefaultAdoptionsResponse.interface';
import { AdoptionQueryParams } from '../../app/adoption/interfaces/DefaultQueryParams.interface';
import { databaseHelper } from '../../helpers/database.helper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdoptionPrismaRepository implements AdoptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllPerUser(
    userId: string,
    params: AdoptionQueryParams,
  ): Promise<DefaultAdoptionsResponse<AdoptionEntity>> {
    const baseParams = databaseHelper.getFindManyParams(params);

    const userAdoptions = await this.prismaService.adoption.findMany({
      ...baseParams,
      where: { adoptionState: {} },
    });
    const total = await this.prismaService.adoption.count(baseParams);

    return {
      page: params.page,
      page_size: params.page_size,
      total,
      registers: userAdoptions,
    };
  }

  async findAll(
    canSeeDonorInfo = false,
    params: AdoptionQueryParams,
  ): Promise<DefaultAdoptionsResponse<AdoptionEntity>> {
    const baseParams = databaseHelper.getFindManyParams(params);

    const selectParams = databaseHelper.getSelectorParams(canSeeDonorInfo);

    const publicAdoptions = await this.prismaService.adoption.findMany({
      ...baseParams,
      ...selectParams,
    });

    const total = await this.prismaService.adoption.count(baseParams);

    return {
      page: params.page,
      page_size: params.page_size,
      total,
      registers: publicAdoptions,
    };
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

  async create(id: string, adoption: AdoptionEntity): Promise<AdoptionEntity> {
    return await this.prismaService.adoption.create({
      data: {
        ...adoption,
        donorId: id,
      },
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
