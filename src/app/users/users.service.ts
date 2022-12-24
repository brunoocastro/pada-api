import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { mailHelper } from '../../helpers/mail.helper';
import { UserRegisterDto } from '../auth/dto/register.dto';
import { MailService } from '../mail/service/mail.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async findById(id: string) {
    const possibleUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    return plainToInstance(UserEntity, possibleUser, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(email: string) {
    const possibleUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    return plainToInstance(UserEntity, possibleUser, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmailWithSensitiveData(email: string) {
    const possibleUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    return possibleUser;
  }

  async getExistentById(id: string) {
    const possibleUser = await this.findById(id);

    if (!possibleUser) throw new NotFoundException('User not found!');

    return possibleUser;
  }

  async create(createUserDto: UserRegisterDto) {
    const possibleUser = await this.findByEmail(createUserDto.email);

    if (possibleUser) throw new BadRequestException('Email already in use!');

    const createdUser = await this.prismaService.user.create({
      data: {
        ...createUserDto,
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const currentUser = await this.getExistentById(id);

    Object.entries(updateUserDto).map(([key, value]) => {
      if (!key) return;
      currentUser[key] = value;
    });

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: currentUser,
      select: {
        name: true,
        picture: true,
        id: true,
        password: false,
      },
    });
    return updatedUser;
  }

  async confirmEmail(id: string, token: string) {
    const user = await this.getExistentById(id);

    console.log({ user, token });

    if (user.emailStatus === 'VERIFIED')
      throw new BadRequestException('Email already verified!');

    if (user.emailStatus === 'UNVERIFIED')
      throw new BadRequestException('Confirmation token invalid!');

    const decodedToken = this.jwtService.verify(token, {
      ignoreExpiration: true,
    });

    console.log({
      isValidToken: decodedToken,
      user,
      date1: new Date(decodedToken.createdAt),
      date2: new Date(user.createdAt),
      equals:
        new Date(decodedToken.createdAt).toISOString() ===
        new Date(user.createdAt).toISOString(),
    });

    if (!decodedToken)
      throw new BadRequestException('Confirmation token invalid! a');

    if (decodedToken.id !== user.id)
      throw new BadRequestException('Confirmation token invalid! b');
    if (decodedToken.email !== user.email)
      throw new BadRequestException('Confirmation token invalid! c');
    if (
      new Date(decodedToken.createdAt).toISOString() !==
      new Date(user.createdAt).toISOString()
    )
      throw new BadRequestException('Confirmation token invalid! d');

    const updatedUser = await this.update(id, { emailStatus: 'VERIFIED' });

    return updatedUser;
  }

  async sendConfirmationEmail(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found!');

    if (user.emailStatus === 'VERIFIED')
      throw new BadRequestException('Email already verified!');

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });

    const url = `${mailHelper.projectUrl}/users/${id}/email/confirm/${token}`;

    const mailSended = await this.mailService.sendConfirmAccountMail({
      confirmationUrl: url,
      to: [{ email: user.email, name: user.name }],
    });

    await this.update(id, { emailStatus: 'PENDING' });

    return mailSended;
  }
  async delete(id: string) {
    await this.getExistentById(id);

    const deletedUser = await this.prismaService.user.delete({
      where: { id },
      select: {
        id: true,
        password: false,
      },
    });

    return deletedUser;
  }
}
