import { Injectable } from '@nestjs/common';
import { AdoptionRepository } from '../../app/adoption/adoption.repository';
import { AdoptionEntity } from '../../app/adoption/entities/adoption.entity';
import { DefaultAdoptionsResponse } from '../../app/adoption/interfaces/DefaultAdoptionsResponse.interface';
import { AdoptionQueryParams } from '../../app/adoption/interfaces/DefaultQueryParams.interface';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdoptionPrismaRepository implements AdoptionRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findAllPerUser(
    userId: string,
    { page, page_size, search }: AdoptionQueryParams,
  ): Promise<DefaultAdoptionsResponse<AdoptionEntity>> {
    const baseParams = {
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { breed: { contains: search } },
              ],
            }
          : {}),
        donorId: userId,
      },
      skip: (page - 1) * page_size,
      take: page_size,
    };

    const userAdoptions = await this.prismaService.adoption.findMany(
      baseParams,
    );
    const total = await this.prismaService.adoption.count(baseParams);

    return {
      page,
      page_size,
      total,
      registers: userAdoptions,
    };
  }

  async findAll(
    canSeeDonorInfo = false,
    { ordering, page, page_size, search }: AdoptionQueryParams,
  ): Promise<DefaultAdoptionsResponse<AdoptionEntity>> {
    const baseParams = {
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { breed: { contains: search } },
              ],
            }
          : {}),
      },
      skip: (page - 1) * page_size,
      take: page_size,
    };

    const selectParams = {
      select: {
        adoptionState: true,
        breed: true,
        gender: true,
        id: true,
        name: true,
        pictures: true,
        species: true,
        donorId: canSeeDonorInfo,
        donor: canSeeDonorInfo
          ? {
              select: {
                email: true,
                password: false,
                name: true,
                id: true,
                phone: true,
              },
            }
          : false,
      },
    };

    const publicAdoptions = await this.prismaService.adoption.findMany({
      ...baseParams,
      ...selectParams,
      where: {
        ...baseParams.where,
        adoptionState: 'INPROGRESS',
      },
    });

    const total = await this.prismaService.adoption.count(baseParams);

    return {
      page,
      page_size,
      total,
      registers: publicAdoptions,
    };
  }

  async findById(id: string): Promise<AdoptionEntity> {
    return await this.prismaService.adoption.findUnique({
      where: { id },
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
