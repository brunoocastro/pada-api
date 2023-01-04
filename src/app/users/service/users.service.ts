import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { cryptoHelper } from '../../../helpers/crypto.helper';
import { mailHelper } from '../../../helpers/mail.helper';
import { RegisterUserDto } from '../../auth/dto/register.dto';
import { MailService } from '../../mail/service/mail.service';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserEntity } from '../entities/user.entity';
import { UsersRepository } from '../repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private async findByIdWithSensitiveData(id: string): Promise<UserEntity> {
    const possibleUser = await this.usersRepository.findById(id);

    if (!possibleUser) return null;

    return new UserEntity(possibleUser);
  }

  async findById(id: string): Promise<UserEntity> {
    const possibleUser = await this.findByIdWithSensitiveData(id);

    if (!possibleUser) return null;
    possibleUser.password = undefined;

    return new UserEntity(possibleUser);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const possibleUser = await this.usersRepository.findByEmail(email);

    if (!possibleUser) return null;

    const userEntity = new UserEntity(possibleUser);
    userEntity.password = undefined;

    return userEntity;
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

  async delete(id: string): Promise<void> {
    await this.getExistentById(id);

    await this.usersRepository.deleteById(id);
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

    if (updateUserPasswordDto.newPassword === updateUserPasswordDto.oldPassword)
      throw new BadRequestException('You need different passwords to update.');

    if (
      !cryptoHelper.validatePassword(
        updateUserPasswordDto.oldPassword,
        currentUser.password,
      )
    )
      throw new UnauthorizedException("Passwords doesn't matches.");

    currentUser.password = cryptoHelper.hashPassword(
      updateUserPasswordDto.newPassword,
    );

    const updatedUser = await this.usersRepository.updateById(id, currentUser);

    const updateResponse = plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });

    return updateResponse;
  }

  async verifyAccountWithToken(
    id: string,
    token: string,
  ): Promise<UserResponseDto> {
    const user = await this.getExistentById(id);

    if (user.emailStatus === 'VERIFIED')
      throw new BadRequestException(mailHelper.errorTexts.alreadyVerified);

    if (user.emailStatus === 'UNVERIFIED')
      throw new BadRequestException(mailHelper.errorTexts.invalidToken);

    const decodedToken = this.jwtService.verify(token, {
      ignoreExpiration: true,
    });

    if (!decodedToken)
      throw new BadRequestException(mailHelper.errorTexts.invalidToken);

    if (decodedToken.id !== user.id)
      throw new BadRequestException(mailHelper.errorTexts.invalidToken);
    if (decodedToken.email !== user.email)
      throw new BadRequestException(mailHelper.errorTexts.invalidToken);
    if (
      new Date(decodedToken.createdAt).toISOString() !==
      new Date(user.createdAt).toISOString()
    )
      throw new BadRequestException(mailHelper.errorTexts.invalidToken);

    const updatedUser = await this.update(id, { emailStatus: 'VERIFIED' });

    return updatedUser;
  }

  async sendAccountVerificationMailById(id: string): Promise<UserResponseDto> {
    const user = await this.getExistentById(id);

    if (user.emailStatus === 'VERIFIED')
      throw new BadRequestException(mailHelper.errorTexts.alreadyVerified);

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });

    const url = `${this.mailService.projectUrl}/user/${id}/verify/${token}`;

    await this.mailService.sendAccountVerificationMail({
      confirmationUrl: url,
      to: { email: user.email, name: user.name },
    });

    const updatedUser = await this.update(id, { emailStatus: 'PENDING' });

    return updatedUser;
  }
}
