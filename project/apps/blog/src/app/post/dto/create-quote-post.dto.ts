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

export class CreateQuotePostDto {
  @ApiProperty({ example: PostType.Quote, enum: PostType })
  public readonly type = PostType.Quote;

  @ApiProperty({ example: 'Любая достаточно продвинутая технология неотличима от магии', description: '20–300 символов' })
  @IsString()
  @MinLength(20)
  @MaxLength(300)
  public quoteText!: string;

  @ApiProperty({ example: 'Артур Кларк', description: '3–50 символов' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  public quoteAuthor!: string;

  @ApiProperty({ example: ['science'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  public tags?: string[];
}
