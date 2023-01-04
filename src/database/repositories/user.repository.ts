import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../../app/auth/dto/register.dto';
import { UserEntity } from '../../app/users/entities/user.entity';
import { UsersRepository } from '../../app/users/repository/users.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserPrismaRepository implements UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<UserEntity> {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }
  async findByEmail(email: string): Promise<UserEntity> {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }
  async create(user: RegisterUserDto): Promise<UserEntity> {
    return await this.prismaService.user.create({
      data: user,
    });
  }
  async updateById(id: string, updatedUser: UserEntity): Promise<UserEntity> {
    return await this.prismaService.user.update({
      where: { id },
      data: updatedUser,
    });
  }
  async deleteById(id: string): Promise<void> {
    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
