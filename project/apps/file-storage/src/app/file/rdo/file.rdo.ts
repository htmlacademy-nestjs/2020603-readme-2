import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FileRdo {
  @ApiProperty({
    description: 'Идентификатор файла',
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    format: 'uuid',
  })
  @Expose()
  public id!: string;

  @ApiProperty({ description: 'Оригинальное имя файла' })
  @Expose()
  public originalName!: string;

  @ApiProperty({ description: 'Имя файла на диске (с расширением)' })
  @Expose()
  public hashName!: string;

  @ApiProperty({
    description: 'MIME-тип, продетектированный по содержимому',
    example: 'image/jpeg',
  })
  @Expose()
  public mimetype!: string;

  @ApiProperty({ description: 'Размер файла в байтах' })
  @Expose()
  public size!: number;

  @ApiProperty({ description: 'Дата загрузки файла' })
  @Expose()
  public createdAt!: Date;

  // Готовый абсолютный URL отдачи статики. subDirectory/path наружу не отдаём —
  // их кодирует url (см. file.service.ts → withUrl).
  @ApiProperty({
    description: 'Абсолютный URL для отдачи файла через статику',
    example: 'http://localhost:3004/static/avatars/2026/01/<uuid>.jpg',
  })
  @Expose()
  public url!: string;
}
