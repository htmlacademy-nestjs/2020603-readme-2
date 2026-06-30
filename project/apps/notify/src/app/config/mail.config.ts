import { registerAs } from '@nestjs/config';

export interface MailConfig {
  host: string;
  port: number;
  from: string;
}

export const MAIL_CONFIG_NAMESPACE = 'mail';

export const mailConfig = registerAs(
  MAIL_CONFIG_NAMESPACE,
  (): MailConfig => ({
    host: process.env.MAIL_SMTP_HOST as string,
    port: Number(process.env.MAIL_SMTP_PORT),
    from: process.env.MAIL_FROM as string,
  }),
);
