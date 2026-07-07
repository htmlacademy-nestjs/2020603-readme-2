import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class FollowersCountParamDto {
  @ApiProperty({
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    description: 'Идентификатор пользователя, чьих подписчиков считаем',
  })
  @IsString()
  @MinLength(1)
  public userId!: string;
}
