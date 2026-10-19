import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

/**
 * Модуль пользователей. Наружу отдаётся только сервис: другие модули
 * не обращаются к репозиторию напрямую.
 */
@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
