import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PasswordHasher } from './password.hasher';
import { UserModule } from '../user/user.module';

@Module({
  imports: [JwtModule, UserModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, PasswordHasher],
})
export class AuthenticationModule {}
