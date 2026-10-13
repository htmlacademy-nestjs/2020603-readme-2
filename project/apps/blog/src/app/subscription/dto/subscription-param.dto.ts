import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubscriptionParamDto {
  @ApiProperty({
    example: '9c8e7b6a-5f4d-43c2-9a1b-0e9d8c7b6a52',
    description: 'Идентификатор пользователя, на которого оформляется подписка',
  })
  @IsString()
  @IsNotEmpty()
  public followingId!: string;
}
