import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { SALT_ROUNDS } from './authentication.constant';

@Injectable()
export class PasswordHasher {
  public async hash(password: string): Promise<string> {
    const salt = await genSalt(SALT_ROUNDS);
    return hash(password, salt);
  }

  public async compare(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  }
}
