import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HasConfirmedAccount } from '../auth/decorators/confirmed-account.decorator';
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { LoggedUser } from '../auth/decorators/logged-user.decorator';
import { ExclusiveForUserWithId } from '../auth/decorators/user-exclusive.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AdoptionService } from './adoption.service';
import { ParseQueryParams } from './decorators/parse-query-params.decorator';
import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { UpdateAdoptionDto } from './dto/update-adoption.dto';
import { AdoptionQueryParams } from './interfaces/DefaultQueryParams.interface';

@Controller('adoption')
@UseGuards(JwtAuthGuard)
export class AdoptionController {
  constructor(
    private readonly adoptionService: AdoptionService,
    private readonly userService: UsersService,
  ) {}

  @Post()
  create(
    @Body() createAdoptionDto: CreateAdoptionDto,
    @HasConfirmedAccount() user: UserResponseDto,
  ) {
    return this.adoptionService.create(user.id, createAdoptionDto);
  }

  @IsPublic()
  @Get('public')
  async getAllPublic(
    @LoggedUser() user: UserEntity,
    @ParseQueryParams() params: AdoptionQueryParams,
  ) {
    return await this.adoptionService.findAll(false, params);
  }

  @Get('')
  async getAll(
    @LoggedUser() user: UserEntity,
    @ParseQueryParams() params: AdoptionQueryParams,
  ) {
    return await this.adoptionService.findAll(
      user && user.emailStatus === 'VERIFIED',
      params,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @HasConfirmedAccount() user: UserResponseDto,
  ) {
    return this.adoptionService.getExistentById(id);
  }

  @Get('user/:id')
  async findUserAdoptions(
    @ExclusiveForUserWithId() userId: string,
    @ParseQueryParams() params: AdoptionQueryParams,
  ) {
    return await this.adoptionService.getAllFromUser(userId, params);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdoptionDto: UpdateAdoptionDto,
    @HasConfirmedAccount() user: UserResponseDto,
  ) {
    await this.adoptionService.validateDonorWithId(id, user.id);
    return await this.adoptionService.update(id, updateAdoptionDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @HasConfirmedAccount() user: UserResponseDto,
  ) {
    await this.adoptionService.validateDonorWithId(id, user.id);
    return await this.adoptionService.remove(id);
  }
}
