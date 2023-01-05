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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import { parse } from 'path';
import { filesHelper } from '../../../helpers/files.helper';
import { HasVerifiedAccount } from '../../auth/decorators/verified-account.decorator';
import { IsPublic } from '../../auth/decorators/is-public.decorator';
import { LoggedUser } from '../../auth/decorators/logged-user.decorator';
import { ExclusiveForUserWithId } from '../../auth/decorators/user-exclusive.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { UserResponseDto } from '../../users/dto/response/user-response.dto';
import { AdoptionService } from './../service/adoption.service';
import { ParseQueryParams } from './../decorators/parse-query-params.decorator';
import { CreateAdoptionDto } from './../dto/create-adoption.dto';
import { UpdateAdoptionDto } from './../dto/update-adoption.dto';
import { AdoptionQueryParams } from './../interfaces/DefaultQueryParams.interface';
import { join } from 'node:path';
import { UsersService } from '../../users/service/users.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ManyAdoptionsResponseDto,
  SingleAdoptionControllerResponseDto,
} from '../dto/response/default-adoption-response.dto';
import { BadRequestResponseDto } from '../../../helpers/swagger/bad-request.dto';
import { NotFoundResponseDto } from '../../../helpers/swagger/not-found.dto';
import { AdoptionWithDonorEntity } from '../entities/adoptionWithDonor.entity';
import { AdoptionEntity } from '../entities/adoption.entity';

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
@ApiTags('adoption')
@UseGuards(JwtAuthGuard)
export class AdoptionController {
  constructor(
    private readonly adoptionService: AdoptionService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a adoption' })
  @ApiResponse({
    status: 201,
    description: 'Adoption created with success',
    type: SingleAdoptionControllerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid Body',
    type: BadRequestResponseDto,
  })
  async createAdoption(
    @Body() createAdoptionDto: CreateAdoptionDto,
    @HasVerifiedAccount() donor: UserResponseDto,
  ): Promise<SingleAdoptionControllerResponseDto> {
    const adoption = await this.adoptionService.create(
      donor.id,
      createAdoptionDto,
    );
    return { adoption, message: 'Adoption successfully created!' };
  }

  @IsPublic()
  @Get('public')
  @ApiOperation({ summary: 'Get all public adoption' })
  @ApiResponse({
    status: 200,
    description: 'Public adoptions found with success',
    type: ManyAdoptionsResponseDto<AdoptionEntity>,
  })
  @ApiResponse({
    status: 400,
    description: 'Non available adoptions with this params',
    type: NotFoundResponseDto,
  })
  async getAllPublic(
    @ParseQueryParams() params: AdoptionQueryParams,
  ): Promise<ManyAdoptionsResponseDto<AdoptionEntity>> {
    return await this.adoptionService.findAll(false, params);
  }

  @Get('')
  @ApiOperation({ summary: 'Get all adoption' })
  @ApiResponse({
    status: 200,
    description: 'Adoptions found with success',
    type: ManyAdoptionsResponseDto<AdoptionWithDonorEntity>,
  })
  @ApiResponse({
    status: 400,
    description: 'Non available adoptions with this params',
    type: NotFoundResponseDto,
  })
  async getAll(
    @LoggedUser() user: UserResponseDto,
    @ParseQueryParams() params: AdoptionQueryParams,
  ): Promise<ManyAdoptionsResponseDto<AdoptionWithDonorEntity>> {
    return await this.adoptionService.findAll(
      user && user.emailStatus === 'VERIFIED',
      params,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get adoption by id' })
  @ApiResponse({
    status: 200,
    description: 'Adoption found with success',
    type: SingleAdoptionControllerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Adoption not found',
    type: NotFoundResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @LoggedUser() donor: UserResponseDto,
  ): Promise<SingleAdoptionControllerResponseDto> {
    const adoption = await this.adoptionService.getExistentById(
      id,
      donor.emailStatus === 'VERIFIED',
    );
    return {
      message: 'Adoption found with success',
      adoption,
    };
  }

  @Get('donor/:id')
  @ApiOperation({
    summary: 'Get all adoptions for donor with id',
  })
  @ApiResponse({
    status: 200,
    description: 'Adoptions found with success',
    type: ManyAdoptionsResponseDto<AdoptionEntity>,
  })
  @ApiResponse({
    status: 400,
    description: 'Donor has no available adoptions with this params',
    type: NotFoundResponseDto,
  })
  async findDonorAdoptions(
    @ExclusiveForUserWithId() donorId: string,
    @ParseQueryParams() params: AdoptionQueryParams,
  ): Promise<ManyAdoptionsResponseDto<AdoptionEntity>> {
    await this.usersService.getExistentById(donorId);
    return await this.adoptionService.getAllFromDonor(donorId, params);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update adoption by id' })
  @ApiResponse({
    status: 200,
    description: 'Adoption updated with success',
    type: SingleAdoptionControllerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Adoption not found',
    type: NotFoundResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateAdoptionDto: UpdateAdoptionDto,
    @HasVerifiedAccount() donor: UserResponseDto,
  ): Promise<SingleAdoptionControllerResponseDto> {
    await this.adoptionService.validateDonorAndReturnAdoption(id, donor.id);
    const adoption = await this.adoptionService.updateById(
      id,
      updateAdoptionDto,
    );
    return {
      message: 'Adoption updated with success',
      adoption,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove adoption by id' })
  @ApiResponse({
    status: 204,
    description: 'Adoption removed with success',
  })
  @ApiResponse({
    status: 400,
    description: 'Adoption not found',
    type: NotFoundResponseDto,
  })
  async remove(
    @Param('id') id: string,
    @HasVerifiedAccount() donor: UserResponseDto,
  ): Promise<void> {
    await this.adoptionService.validateDonorAndReturnAdoption(id, donor.id);
    await this.adoptionService.removeById(id);
  }

  @Post(':id/picture/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Uploads and add adoption picture',
  })
  @ApiResponse({
    status: 200,
    description: 'Adoption picture uploaded with success',
    type: SingleAdoptionControllerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Adoption picture format or size invalid',
    type: BadRequestResponseDto,
  })
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
  @ApiOperation({ summary: 'Get adoption picture' })
  @ApiResponse({
    status: 200,
    description: 'Returned adoption picture with success',
    type: Blob,
  })
  @ApiResponse({
    status: 400,
    description: 'Adoption picture not found',
  })
  async getAdoptionPicture(@Param('name') name: string, @Res() res) {
    return await res.sendFile(
      join(process.cwd(), `${fileHelper.adoptionPicture.path}/${name}`),
    );
  }
}
