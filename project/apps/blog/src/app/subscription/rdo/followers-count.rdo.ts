import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FollowersCountRdo {
  @ApiProperty({
    description: 'Количество подписчиков пользователя',
    example: 5,
  })
  @Expose()
  public count!: number;
}
