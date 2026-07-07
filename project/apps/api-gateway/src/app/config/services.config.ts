import { registerAs } from '@nestjs/config';

export interface ServicesConfig {
  usersServiceUrl: string;
  blogServiceUrl: string;
  fileStorageServiceUrl: string;
  notifyServiceUrl: string;
  httpTimeout: number;
}

export const SERVICES_CONFIG_NAMESPACE = 'services';

export const servicesConfig = registerAs(
  SERVICES_CONFIG_NAMESPACE,
  (): ServicesConfig => ({
    usersServiceUrl: process.env.USERS_SERVICE_URL as string,
    blogServiceUrl: process.env.BLOG_SERVICE_URL as string,
    fileStorageServiceUrl: process.env.FILE_STORAGE_SERVICE_URL as string,
    notifyServiceUrl: process.env.NOTIFY_SERVICE_URL as string,
    httpTimeout: Number(process.env.HTTP_CLIENT_TIMEOUT ?? 5000),
  }),
);
