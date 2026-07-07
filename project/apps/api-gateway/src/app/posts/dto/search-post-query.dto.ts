import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SearchPostQueryDto {
  @ApiProperty({
    example: 'nestjs',
    description: 'Строка для поиска по заголовку публикации',
    minLength: 1,
    maxLength: 50,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  public title!: string;
}
