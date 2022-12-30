import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { RegisterUserDto } from '../auth/dto/register.dto';
import { MailService } from '../mail/mail.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UserWithSensitiveDataDto } from './dto/user-with-sensitive-data.dto';
import { cryptoHelper } from '../../helpers/crypto.helper';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { mailHelper } from '../../helpers/mail.helper';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const possibleUser = await this.usersRepository.findById(id);

    return plainToInstance(UserEntity, possibleUser, {
      excludeExtraneousValues: true,
    });
  }
  private async findByIdWithSensitiveData(
    id: string,
  ): Promise<UserWithSensitiveDataDto> {
    const possibleUser = await this.usersRepository.findById(id);

    return plainToInstance(UserWithSensitiveDataDto, possibleUser, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const possibleUser = await this.usersRepository.findByEmail(email);

    return plainToInstance(UserEntity, possibleUser, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmailWithSensitiveData(
    email: string,
  ): Promise<UserWithSensitiveDataDto> {
    const possibleUser = await this.usersRepository.findByEmail(email);

    return plainToInstance(UserWithSensitiveDataDto, possibleUser, {
      excludeExtraneousValues: true,
    });
  }

  async getExistentById(id: string): Promise<UserEntity> {
    const possibleUser = await this.findById(id);

    if (!possibleUser) throw new NotFoundException('User not found!');

    return possibleUser;
  }

  async create(createUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const possibleUser = await this.findByEmail(createUserDto.email);

    if (possibleUser) throw new BadRequestException('Email already in use!');

    const newUserData: RegisterUserDto = {
      ...createUserDto,
      password: cryptoHelper.hashPassword(createUserDto.password),
    };

    const createdUser = await this.usersRepository.create(newUserData);

    const createResponse = plainToInstance(UserResponseDto, createdUser, {
      excludeExtraneousValues: true,
    });

    return createResponse;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const currentUser = await this.getExistentById(id);

    Object.entries(updateUserDto).map(([key, value]) => {
      if (!key) return;
      currentUser[key] = value;
    });

    const updatedUser = await this.usersRepository.updateById(id, currentUser);

    const updateResponse = plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });

    return updateResponse;
  }

  async updatePassword(
    id: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<UserResponseDto> {
    const currentUser = await this.findByIdWithSensitiveData(id);

    if (updateUserPasswordDto.newPassword === updateUserPasswordDto.newPassword)
      throw new BadRequestException('You need diferentes passwords to update.');

    if (
      !cryptoHelper.validatePassword(
        updateUserPasswordDto.oldPassword,
        currentUser.password,
      )
    )
      throw new UnauthorizedException("Password doesn't matches.");

    currentUser.password = cryptoHelper.hashPassword(
      updateUserPasswordDto.newPassword,
    );

    const updatedUser = await this.usersRepository.updateById(id, currentUser);

    const updateResponse = plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });

    return updateResponse;
  }

  async confirmAccountWithToken(
    id: string,
    token: string,
  ): Promise<UserResponseDto> {
    const user = await this.getExistentById(id);

    if (user.emailStatus === 'VERIFIED')
      throw new BadRequestException('Email already verified!');

    if (user.emailStatus === 'UNVERIFIED')
      throw new BadRequestException('Confirmation token invalid!');

    const decodedToken = this.jwtService.verify(token, {
      ignoreExpiration: true,
    });

    if (!decodedToken)
      throw new BadRequestException('Confirmation token invalid!');

    if (decodedToken.id !== user.id)
      throw new BadRequestException('Confirmation token invalid!');
    if (decodedToken.email !== user.email)
      throw new BadRequestException('Confirmation token invalid!');
    if (
      new Date(decodedToken.createdAt).toISOString() !==
      new Date(user.createdAt).toISOString()
    )
      throw new BadRequestException('Confirmation token invalid!');

    const updatedUser = await this.update(id, { emailStatus: 'VERIFIED' });

    return updatedUser;
  }

  async sendUserConfirmationMailById(id: string): Promise<UserResponseDto> {
    const user = await this.getExistentById(id);

    if (user.emailStatus === 'VERIFIED')
      throw new BadRequestException('Email already verified!');

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });

    const url = `${mailHelper.projectUrl}/user/${id}/mail/confirm/${token}`;

    await this.mailService.sendConfirmAccountMail({
      confirmationUrl: url,
      to: { email: user.email, name: user.name },
    });

    const updatedUser = await this.update(id, { emailStatus: 'PENDING' });

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    await this.getExistentById(id);

    await this.usersRepository.deleteById(id);
  }
}
