import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: RegisterUserDto) {
    const possibleUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (possibleUser) throw new BadRequestException('Email already in use!');

    const createdUser = await this.prisma.user.create({
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
    const currentUser = await this.prisma.user.findUnique({ where: { id } });

    console.log(currentUser);

    if (!currentUser) {
      throw new NotFoundException('User not found!');
    }

    Object.entries(updateUserDto).map(([key, value]) => {
      if (!key) return;
      currentUser[key] = value;
    });

    const updatedUser = await this.prisma.user.update({
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

  async validateUserLogin(email: string, password: string) {
    const existentUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        password: true,
        id: true,
      },
    });

    if (!existentUser) return null;

    const isValidPassword = compareSync(password, existentUser.password);

    if (!isValidPassword) return null;

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: { ...existentUser, lastLogin: new Date() },
      select: {
        name: true,
        birth: true,
        picture: true,
        id: true,
        emailVerified: true,
        password: false,
      },
    });

    return updatedUser;
  }
}
