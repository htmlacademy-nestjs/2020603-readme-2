import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SubscriptionRdo {
  @ApiProperty({ description: 'Идентификатор подписки' })
  @Expose()
  public id!: string;

  @ApiProperty({ description: 'Идентификатор подписчика' })
  @Expose()
  public followerId!: string;

  @ApiProperty({ description: 'Идентификатор пользователя, на которого подписались' })
  @Expose()
  public followingId!: string;

  @ApiProperty({ description: 'Дата создания подписки' })
  @Expose()
  public createdAt!: Date;
}
