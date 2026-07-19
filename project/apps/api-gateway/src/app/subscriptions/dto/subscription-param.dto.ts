import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SubscriptionParamDto {
  @ApiProperty({
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    description: 'Идентификатор пользователя, на которого оформляется подписка',
  })
  @IsString()
  @MinLength(1)
  public followingId!: string;
}
