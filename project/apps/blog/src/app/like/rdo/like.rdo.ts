import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LikeRdo {
  @ApiProperty({ description: 'Идентификатор лайка' })
  @Expose()
  public id!: string;

  @ApiProperty({ description: 'Идентификатор публикации' })
  @Expose()
  public postId!: string;

  @ApiProperty({ description: 'Идентификатор пользователя' })
  @Expose()
  public userId!: string;

  @ApiProperty({ description: 'Дата создания' })
  @Expose()
  public createdAt!: Date;
}
