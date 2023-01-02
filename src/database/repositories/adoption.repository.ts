import { Injectable } from '@nestjs/common';
import { AdoptionRepository } from '../../app/adoption/adoption.repository';
import { AdoptionEntity } from '../../app/adoption/entities/adoption.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdoptionPrismaRepository implements AdoptionRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findAll(): Promise<AdoptionEntity[]> {
    return await this.prismaService.adoption.findMany();
  }

  async findById(id: string): Promise<AdoptionEntity> {
    return await this.prismaService.adoption.findUnique({
      where: { id },
    });
  }
  async create(adoption: AdoptionEntity): Promise<AdoptionEntity> {
    return await this.prismaService.adoption.create({
      data: adoption,
    });
  }
  async updateById(
    id: string,
    updatedadoption: AdoptionEntity,
  ): Promise<AdoptionEntity> {
    return await this.prismaService.adoption.update({
      where: { id },
      data: updatedadoption,
    });
  }
  async deleteById(id: string): Promise<void> {
    await this.prismaService.adoption.delete({
      where: { id },
    });
  }
}
