import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import { parse } from 'path';
import { filesHelper } from '../../helpers/files.helper';
import { HasVerifiedAccount } from '../auth/decorators/verified-account.decorator';
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { LoggedUser } from '../auth/decorators/logged-user.decorator';
import { ExclusiveForUserWithId } from '../auth/decorators/user-exclusive.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserEntity } from '../users/entities/user.entity';
import { AdoptionService } from './adoption.service';
import { ParseQueryParams } from './decorators/parse-query-params.decorator';
import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { UpdateAdoptionDto } from './dto/update-adoption.dto';
import { AdoptionQueryParams } from './interfaces/DefaultQueryParams.interface';
import { join } from 'node:path';
import { UsersService } from '../users/users.service';

const fileHelper = new filesHelper();
const adoptionPictureStorage = {
  storage: diskStorage({
    destination: '.' + fileHelper.adoptionPicture.path,
    filename: (req, file, cb) => {
      const filename = `${fileHelper.adoptionPicture.prefix}${parse(
        file.originalname,
      ).name.replace(/\s/g, '')}-${randomUUID()}`;

      const extension: string = parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('adoption')
@UseGuards(JwtAuthGuard)
export class AdoptionController {
  constructor(
    private readonly adoptionService: AdoptionService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async createAdoption(
    @Body() createAdoptionDto: CreateAdoptionDto,
    @HasVerifiedAccount() donor: UserResponseDto,
  ) {
    return await this.adoptionService.create(donor.id, createAdoptionDto);
  }

  @IsPublic()
  @Get('public')
  async getAllPublic(@ParseQueryParams() params: AdoptionQueryParams) {
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
  async findOne(@Param('id') id: string, @LoggedUser() donor: UserResponseDto) {
    return await this.adoptionService.getExistentById(
      id,
      donor.emailStatus === 'VERIFIED',
    );
  }

  @Get('donor/:id')
  async findDonorAdoptions(
    @ExclusiveForUserWithId() donorId: string,
    @ParseQueryParams() params: AdoptionQueryParams,
  ) {
    await this.usersService.getExistentById(donorId);
    return await this.adoptionService.getAllFromDonor(donorId, params);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdoptionDto: UpdateAdoptionDto,
    @HasVerifiedAccount() donor: UserResponseDto,
  ) {
    await this.adoptionService.validateDonorAndReturnAdoption(id, donor.id);
    return await this.adoptionService.updateById(id, updateAdoptionDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @HasVerifiedAccount() donor: UserResponseDto,
  ) {
    await this.adoptionService.validateDonorAndReturnAdoption(id, donor.id);
    return await this.adoptionService.removeById(id);
  }

  @Post(':id/picture/upload')
  @UseInterceptors(FileInterceptor('file', adoptionPictureStorage))
  async uploadAdoptionPicture(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @HasVerifiedAccount() donor: UserResponseDto,
  ) {
    const adoption = await this.adoptionService.validateDonorAndReturnAdoption(
      id,
      donor.id,
    );

    console.log({ pictures: adoption.pictures });
    const pictures = adoption.pictures;

    pictures[Object.keys(pictures).length + 1] = file.filename;

    const updatedAdoption = await this.adoptionService.updateById(id, {
      pictures: pictures,
    });
    return {
      message: 'Picture successfully uploaded to adoption.',
      adoption: updatedAdoption,
    };
  }

  @Get('/picture/:name')
  async getAdoptionPicture(@Param('name') name: string, @Res() res) {
    return await res.sendFile(
      join(process.cwd(), `${fileHelper.adoptionPicture.path}/${name}`),
    );
  }
}
