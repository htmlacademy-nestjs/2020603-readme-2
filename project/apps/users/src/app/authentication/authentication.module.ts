import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PasswordHasher } from './password.hasher';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, PasswordHasher],
})
export class AuthenticationModule {}
