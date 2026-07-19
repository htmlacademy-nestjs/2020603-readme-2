import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NewsletterResultRdo {
  @ApiProperty({ description: 'Количество новых публикаций в дайджесте', example: 5 })
  @Expose()
  public posts!: number;

  @ApiProperty({ description: 'Количество получателей рассылки', example: 3 })
  @Expose()
  public recipients!: number;

  @ApiProperty({ description: 'Количество успешно отправленных писем', example: 3 })
  @Expose()
  public sent!: number;

  @ApiProperty({ description: 'Количество неудачных отправок', example: 0 })
  @Expose()
  public failed!: number;
}
