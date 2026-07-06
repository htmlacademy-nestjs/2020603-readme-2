import { IsEmail, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * Контракт события `add.subscriber`: данные нового подписчика, которые сервис
 * пользователей публикует при регистрации.
 */
export class CreateSubscriberDto {
  @IsUUID()
  public userId!: string;

  @IsEmail()
  public email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  public name!: string;
}
