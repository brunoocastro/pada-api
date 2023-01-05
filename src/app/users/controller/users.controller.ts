import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Delete,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsPublic } from '../../auth/decorators/is-public.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guards';
import { ExclusiveForUserWithId } from '../../auth/decorators/user-exclusive.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, parse } from 'path';
import { filesHelper } from '../../../helpers/files.helper';
import { UsersService } from '../service/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DefaultUserControllerResponseDto } from '../dto/response/default-user-response.dto';
import { NotFoundResponseDto } from '../../../helpers/swagger/not-found.dto';

const fileHelper = new filesHelper();
const userPictureStorage = {
  storage: diskStorage({
    destination: '.' + fileHelper.userPicture.path,
    filename: (req, file, cb) => {
      const filename = `${fileHelper.userPicture.prefix}${req.params.id}`;

      const extension: string = parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('user')
@ApiBearerAuth()
@ApiTags('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user data by id' })
  @ApiResponse({
    status: 200,
    description: 'Get user data with success',
    type: DefaultUserControllerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
    type: NotFoundResponseDto,
  })
  async getUser(
    @ExclusiveForUserWithId() id: string,
  ): Promise<DefaultUserControllerResponseDto> {
    const user = await this.usersService.getExistentById(id);
    return { message: 'User found with success!', user };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user data by id' })
  @ApiResponse({
    status: 200,
    description: 'User data updated with success',
    type: DefaultUserControllerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
    type: NotFoundResponseDto,
  })
  async updateUser(
    @ExclusiveForUserWithId() id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<DefaultUserControllerResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      message: 'User updated with success!',
      user,
    };
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({
    status: 200,
    description: 'User password updated with success',
    type: DefaultUserControllerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
    type: NotFoundResponseDto,
  })
  async updateUserPassword(
    @ExclusiveForUserWithId() id: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<DefaultUserControllerResponseDto> {
    const user = await this.usersService.updatePassword(
      id,
      updateUserPasswordDto,
    );
    return {
      message: 'User password updated with success!',
      user,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiResponse({
    status: 204,
    description: 'User deleted with success',
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
    type: NotFoundResponseDto,
  })
  async deleteUser(@ExclusiveForUserWithId() id: string): Promise<void> {
    await this.usersService.delete(id);
  }

  @IsPublic()
  @Get(':id/verify/:token')
  @ApiOperation({ summary: 'Verify user account with token received by email' })
  @ApiResponse({
    status: 200,
    description: 'Account verified with success',
    type: DefaultUserControllerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
    type: NotFoundResponseDto,
  })
  async verifyAccountByMail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('token') token: string,
  ) {
    const updatedUser = await this.usersService.verifyAccountWithToken(
      id,
      token,
    );
    return { message: 'Account verified with success!', user: updatedUser };
  }

  @Get(':id/mail/send')
  @ApiOperation({ summary: 'Send account verification mail' })
  @ApiResponse({
    status: 200,
    description: 'Account verification mail with success',
    type: DefaultUserControllerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
    type: NotFoundResponseDto,
  })
  async sendAccountVerificationMail(@ExclusiveForUserWithId() id: string) {
    const updatedUser = await this.usersService.sendAccountVerificationMailById(
      id,
    );
    return {
      message:
        'Verification mail sended with success! Access your email an access a received link to verify your account.',
      user: updatedUser,
    };
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
    summary: 'Uploads and update user picture',
  })
  @ApiResponse({
    status: 200,
    description: 'User picture upload with success',
    type: DefaultUserControllerResponseDto,
  })
  @UseInterceptors(FileInterceptor('file', userPictureStorage))
  async uploadUserPicture(
    @ExclusiveForUserWithId() id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const updatedUser = await this.updateUser(id, {
      picture: file.filename,
    });
    return {
      message: 'User picture successfully uploaded',
      user: updatedUser,
    };
  }

  @Get(':id/picture')
  @ApiOperation({ summary: 'Get user picture' })
  @ApiResponse({
    status: 200,
    description: 'Returned user picture with success',
    type: Blob,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
  })
  async getUserPicture(@ExclusiveForUserWithId() id: string, @Res() res) {
    const user = await this.usersService.getExistentById(id);
    return res.sendFile(
      join(process.cwd(), `${fileHelper.userPicture.path}/${user.picture}`),
    );
  }
}
