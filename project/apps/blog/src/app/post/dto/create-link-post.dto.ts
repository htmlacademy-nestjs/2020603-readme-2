import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { PostType } from '@project/shared-types';

export class CreateLinkPostDto {
  @ApiProperty({ example: PostType.Link, enum: PostType })
  public readonly type = PostType.Link;

  @ApiProperty({ example: 'https://nestjs.com', description: 'Валидный URL' })
  @IsUrl()
  public link!: string;

  @ApiProperty({ example: 'Официальный сайт NestJS', description: 'До 300 символов', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  public description?: string;

  @ApiProperty({ example: ['nestjs', 'framework'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  public tags?: string[];
}
