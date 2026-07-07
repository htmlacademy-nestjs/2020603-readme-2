import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { fillRdo } from '@project/shared-helpers';
import { FileService } from './file.service.js';
import { FileRdo } from './rdo/file.rdo.js';
import { FileIdParamDto } from './dto/file-id-param.dto.js';
import {
  AVATAR_MAX_FILE_SIZE,
  IMAGE_MIME_TYPE_PATTERN,
  PHOTO_MAX_FILE_SIZE,
  FileKind,
} from './file.constant.js';

const multipartBodySchema = {
  schema: {
    type: 'object',
    required: ['file'],
    properties: {
      file: { type: 'string', format: 'binary' },
    },
  },
};

@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить аватар (jpeg/png, до 500 КБ)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(multipartBodySchema)
  @ApiCreatedResponse({
    description: 'Аватар успешно загружен',
    type: FileRdo,
  })
  @ApiBadRequestResponse({ description: 'Невалидный файл (формат или размер)' })
  public async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: AVATAR_MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: IMAGE_MIME_TYPE_PATTERN }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<FileRdo> {
    const stored = await this.fileService.saveFile(file, FileKind.Avatar);
    return fillRdo(FileRdo, stored);
  }

  @Post('photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить фото-публикацию (jpeg/png, до 1 МБ)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(multipartBodySchema)
  @ApiCreatedResponse({
    description: 'Фото успешно загружено',
    type: FileRdo,
  })
  @ApiBadRequestResponse({ description: 'Невалидный файл (формат или размер)' })
  public async uploadPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: PHOTO_MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: IMAGE_MIME_TYPE_PATTERN }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<FileRdo> {
    const stored = await this.fileService.saveFile(file, FileKind.Photo);
    return fillRdo(FileRdo, stored);
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Получить информацию о файле по ID' })
  @ApiParam({
    name: 'fileId',
    description: 'Идентификатор файла',
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Информация о файле', type: FileRdo })
  @ApiBadRequestResponse({ description: 'Невалидный идентификатор файла' })
  @ApiNotFoundResponse({ description: 'Файл не найден' })
  public async show(@Param() params: FileIdParamDto): Promise<FileRdo> {
    const stored = await this.fileService.getFile(params.fileId);
    return fillRdo(FileRdo, stored);
  }
}
