import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { isUUID } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import { servicesConfig } from '../config';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type WithAuthor<T> = T & { author: UserInfo | null };

@Injectable()
export class UsersClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  public async register(data: {
    email: string;
    name: string;
    password: string;
    avatarUrl?: string;
  }): Promise<UserResponse> {
    const { data: body } = await firstValueFrom(
      this.httpService.post<UserResponse>(
        `${this.config.usersUrl}/auth/register`,
        data,
      ),
    );
    return body;
  }

  public async login(data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    const { data: body } = await firstValueFrom(
      this.httpService.post<LoginResponse>(
        `${this.config.usersUrl}/auth/login`,
        data,
      ),
    );
    return body;
  }

  public async refresh(data: { refreshToken: string }): Promise<LoginResponse> {
    const { data: body } = await firstValueFrom(
      this.httpService.post<LoginResponse>(
        `${this.config.usersUrl}/auth/refresh`,
        data,
      ),
    );
    return body;
  }

  public async getById(id: string): Promise<UserResponse> {
    const { data: body } = await firstValueFrom(
      this.httpService.get<UserResponse>(`${this.config.usersUrl}/users/${id}`),
    );
    return body;
  }

  public async changePassword(
    id: string,
    data: { currentPassword: string; newPassword: string },
  ): Promise<UserResponse> {
    const { data: body } = await firstValueFrom(
      this.httpService.patch<UserResponse>(
        `${this.config.usersUrl}/auth/${id}/password`,
        data,
      ),
    );
    return body;
  }

  /** Карточки пользователей по идентификаторам; повторы запрашиваются один раз. */
  public async getInfoMap(
    ids: string[],
  ): Promise<Map<string, UserInfo | null>> {
    const entries = await Promise.all(
      [...new Set(ids)].map(
        async (id) => [id, await this.findInfo(id)] as const,
      ),
    );
    return new Map(entries);
  }

  /** Добавляет к каждой записи карточку её автора (§3.7, §3.10). */
  public async attachAuthors<T extends { authorId: string }>(
    items: T[],
  ): Promise<WithAuthor<T>[]> {
    const authors = await this.getInfoMap(items.map((item) => item.authorId));
    return items.map((item) => ({
      ...item,
      author: authors.get(item.authorId) ?? null,
    }));
  }

  /**
   * Карточка пользователя или null: ошибка users и идентификатор не в формате
   * UUID (users ответил бы 400) не должны ломать ответ со списком.
   */
  private async findInfo(id: string): Promise<UserInfo | null> {
    if (!isUUID(id)) {
      return null;
    }

    try {
      const { name, email, avatarUrl } = await this.getById(id);
      return { id, name, email, avatarUrl };
    } catch {
      return null;
    }
  }
}
