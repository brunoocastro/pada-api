import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { UserRegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: UserRegisterDto) {
    const possibleUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (possibleUser) throw new BadRequestException('Email already in use!');

    const createdUser = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        birth: new Date(createUserDto.birth),
        id: randomUUID(),
      },
      select: {
        password: false,
        createdAt: true,
        id: true,
      },
    });

    return createdUser;
  }

  findById(id: string) {
    return `This action returns a #${id} user`;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const currentUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found!');
    }

    Object.entries(updateUserDto).map(([key, value]) => {
      if (!key) return;
      currentUser[key] = value;
    });

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: currentUser,
      select: {
        name: true,
        birth: true,
        picture: true,
        id: true,
        password: false,
      },
    });
    return updatedUser;
  }

  async findByEmail(email: string) {
    return await this.prismaService.user.findUnique({ where: { email } });
  }

  async userLoginConfirmed(id: string) {
    const currentUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    currentUser.lastLogin = new Date();

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: currentUser,
      select: {
        id: true,
        name: true,
        birth: true,
        picture: true,
        emailVerified: true,
        password: false,
      },
    });

    return updatedUser;
  }
}
