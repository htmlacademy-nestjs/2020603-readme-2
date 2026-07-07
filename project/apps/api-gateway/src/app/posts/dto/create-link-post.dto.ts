import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateLinkPostDto {
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
