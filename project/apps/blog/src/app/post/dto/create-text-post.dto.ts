import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostType } from '@project/shared-types';

export class CreateTextPostDto {
  @ApiProperty({ example: PostType.Text, enum: PostType })
  public readonly type = PostType.Text;

  @ApiProperty({ example: 'Мой первый пост о TypeScript разработке', description: '20–50 символов' })
  @IsString()
  @MinLength(20)
  @MaxLength(50)
  public title!: string;

  @ApiProperty({ example: 'Краткий анонс публикации, который заинтересует читателя', description: '50–255 символов' })
  @IsString()
  @MinLength(50)
  @MaxLength(255)
  public announce!: string;

  @ApiProperty({ example: 'Полный текст публикации...', description: '100–1024 символа' })
  @IsString()
  @MinLength(100)
  @MaxLength(1024)
  public text!: string;

  @ApiProperty({ example: ['typescript'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  public tags?: string[];
}
