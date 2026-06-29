import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SubscriptionParamDto {
  @ApiProperty({
    example: '6571e8c9b4a1f2d3e4a5b6c8',
    description: 'Идентификатор пользователя, на которого оформляется подписка',
  })
  @IsString()
  @MinLength(1)
  public followingId!: string;
}
