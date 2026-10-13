import { registerAs } from '@nestjs/config';

export interface ServicesConfig {
  usersUrl: string;
  blogUrl: string;
  fileStorageUrl: string;
  notifyUrl: string;
  httpTimeout: number;
}

export const SERVICES_CONFIG_NAMESPACE = 'services';

export const servicesConfig = registerAs(
  SERVICES_CONFIG_NAMESPACE,
  (): ServicesConfig => ({
    usersUrl: process.env.USERS_SERVICE_URL as string,
    blogUrl: process.env.BLOG_SERVICE_URL as string,
    fileStorageUrl: process.env.FILE_STORAGE_SERVICE_URL as string,
    notifyUrl: process.env.NOTIFY_SERVICE_URL as string,
    // Значение по умолчанию задано в env.validation.ts: после валидации
    // @nestjs/config записывает его в process.env.
    httpTimeout: Number(process.env.HTTP_CLIENT_TIMEOUT),
  }),
);
