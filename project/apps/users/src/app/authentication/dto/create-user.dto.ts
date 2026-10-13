import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { RegisterUserDto } from '@project/shared-dto';

/** Регистрация в сервисе users: к данным формы добавляется URL загруженного аватара. */
export class CreateUserDto extends RegisterUserDto {
  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL аватара',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  public avatarUrl?: string;
}
