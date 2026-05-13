import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserMemoryRepository } from './user-memory.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserMemoryRepository],
  exports: [UserMemoryRepository],
})
export class UserModule {}
