# AGENTS.md

HTML Academy "Readme" course project: NestJS 11 + Nx 22 monorepo, ESM, `"type": "module"`.

## Critical Layout
- All real code is in `project/`. Run every `npm`, `nx`, `prisma`, and `docker compose` command from `project/`, not from the repo root.
- The repo root only holds course docs (`Readme.md`, `Workflow.md`, `Contributing.md`, `specification.md`), `markup/`, and this `AGENTS.md`.
- `project/package.json` has empty `scripts: {}`. Ignore `Workflow.md` commands like `npm run compile|build|lint|start|ts`; use Nx targets instead.
- `.github/workflows/check.yml` is stale/no-op because it expects a root `package.json`. Use Node 20+ locally.

## Commands
- Install: `npm install`
- Serve users: `npx nx serve users`
- Serve blog: `npx nx serve blog`
- Serve notify: `npx nx serve notify` (hybrid app: HTTP + RabbitMQ consumer)
- Serve file-storage: `npx nx serve file-storage`
- Build one app: `npx nx build users`, `npx nx build blog`, `npx nx build notify`, or `npx nx build file-storage`
- Lint one app: `npx nx lint users`, `npx nx lint blog`, `npx nx lint notify`, or `npx nx lint file-storage`
- Lint all: `npx nx run-many -t lint`
- Test one app: `npx nx test users`, `npx nx test blog`, `npx nx test notify`, or `npx nx test file-storage`
- Test all: `npx nx run-many -t test`
- Focused Jest test: `npx nx test <app> -t "<name>"`
- Inspect targets: `npx nx show project <app>` (`users` | `blog` | `notify` | `file-storage`)
- Prisma validate: `npx nx db-validate <app>`
- Prisma generate: `npx nx db-generate <app>`
- Prisma migrate: `npx nx db-migrate <app> --name <name>`
- Prisma reset: `npx nx db-reset <app>`
- Prisma seed: `npx nx db-fill <app>`

## Verification Status
- `npx nx build <app>` works and is the main compile check.
- `npx nx test <app>` works with Jest 30 via SWC.
- `npx nx lint users` is clean.
- `npx nx lint blog` passes with one known warning in `apps/blog/src/app/post/post.controller.ts` for `update(@Body() dto: any)`.
- `npx nx lint notify` and `npx nx build notify` are clean. Note: `notify`'s `webpack.config.js` sets `useTsconfigPaths: true` so the build resolves `@project/*` aliases.
- `npx nx lint file-storage`, `npx nx build file-storage`, and `npx nx test file-storage` are clean. `file-storage`'s `webpack.config.js` also sets `useTsconfigPaths: true` for `@project/*` resolution.
- `npx nx typecheck <app>` is still a known problem: inferred Nx target runs `tsc --build --emitDeclarationOnly`, while workspace aliases map `@project/*` to lib source without TS project references. Use `nx build` and `nx test` as verification until a project-references migration is done.
- `users`, `blog`, `notify`, and `file-storage` use Prisma DB targets. `db-validate` and `db-generate` do not need a running DB. `db-migrate`, `db-reset`, and `db-fill` need Postgres up. `file-storage` has no `db-fill` (no seed).

## Apps
- `users`: Prisma + PostgreSQL service. Implements registration, login, JWT access/refresh tokens, password change, Prisma-backed user repository, UUID primary keys, bcrypt password hashes.
- `blog`: Prisma + PostgreSQL service. Implements posts, comments, likes, subscriptions, feed, filtering, search, pagination, and RDO serialization. It still uses `STUB_USER_ID` instead of real auth/API Gateway integration. Publishes an `add.post` event to notify's RabbitMQ queue on post create/repost via the `notify-client/` feature (`ClientProxy.emit`).
- `file-storage`: Prisma + PostgreSQL (metadata) + filesystem (binaries) service. Implements upload/serve of files (avatars, photo-posts). Endpoints: `POST /api/files/avatar` (≤ 500 КБ), `POST /api/files/photo` (≤ 1 МБ) — both jpeg/png only, validated by magic bytes via `FileTypeValidator` (Nest 11 default, `file-type@21.3.4` on `file.buffer`; multer memory storage); `GET /api/files/:fileId` returns metadata RDO + a ready absolute `url`. Statics served through `app.useStaticAssets` (`NestExpressApplication`) under `/static` (outside the `api` prefix); no `@nestjs/serve-static` dependency. `FileModule` is imported into `AppModule`. Magic numbers: app `3004`, Postgres `5436`, pgAdmin `8085`. Sample fixtures + REST Client smoke in `apps/file-storage/file-storage.http`. No seed (no `db-fill` target).
- `notify`: Prisma + PostgreSQL service for email newsletters (§7). Hybrid app: a RabbitMQ consumer (`@EventPattern` for `add.subscriber` and `add.post`) plus one synchronous HTTP trigger `POST /api/newsletters`. Sends mail via `@nestjs-modules/mailer` to a Mailpit fake SMTP. `blog` publishes `add.post`; `users` does not publish `add.subscriber` yet. The message contract (`RabbitRouting` enum, `PostNotification`) lives in `@project/shared-types`.
- No `*-e2e` apps exist, though `nx.json` still lists them in Jest excludes.

## Shared Libs
- `@project/shared-types`: domain classes/enums/interfaces (`User`, post union types, `Comment`, `Like`, `PostType`, `TokenPayload`, `PaginationResult`, etc.), plus the RabbitMQ contract shared by producers and consumer (`RabbitRouting` enum, `PostNotification`).
- `@project/shared-errors`: domain error base classes and `DomainExceptionFilter`.
- `@project/shared-config`: shared env/config infrastructure — `validateEnvironment(schema, config)`, the `Environment` enum, and the `registerAs` factories `appConfig`, `postgresConfig`, `rabbitmqConfig` (with their `AppConfig`/`PostgresConfig`/`RabbitmqConfig` interfaces).
- `@project/shared-helpers`: RDO serialization helpers `fillRdo`, `fillRdoList`, `fillRdoPagination`, plus connection-string builders `getPostgresConnectionString` and `getRabbitmqConnectionString` (build a URL from a config object).
- Each app keeps only its own env contract in `apps/<app>/src/app/config/`: `EnvironmentVariables` + `validateEnv` in `env.validation.ts`, the `index.ts` barrel, and any service-specific `registerAs` config (`jwt.config.ts` in `users`, `mail.config.ts` in `notify`, `storage.config.ts` in `file-storage`). There is no per-app `helpers/` directory — the shared factories, `Environment` enum, and connection-string builders are imported from the libs above.

## Conventions
- ESM project. Use `.js` suffix in runtime ESM imports where required by generated/runtime scripts.
- Prettier: single quotes, 2-space indent, LF, final newline.
- Import shared libs via aliases like `@project/shared-types`, not relative paths.
- Per feature: `<feature>.controller.ts`, `<feature>.service.ts`, `<feature>.module.ts`, `<feature>.repository.ts`, constants/errors, `dto/`, `rdo/`.
- Prisma schema files live in `apps/<app>/prisma/schema.prisma`. Do not add per-feature schema files for Prisma apps.
- Feature modules declare their controller/service/repository and are imported into `app.module.ts`.
- DTOs are input contracts with `class-validator` and `@ApiProperty`.
- RDOs are output contracts with `class-transformer` `@Expose`.
- Controllers serialize via `plainToInstance(...)` or shared helpers like `fillRdo`, `fillRdoList`, `fillRdoPagination`.
- Services throw domain errors from feature `*.errors.ts`, not raw Nest HTTP exceptions.
- `main.ts` registers `DomainExceptionFilter`.
- `main.ts` uses global prefix `api`, Swagger at `/spec`, and strict `ValidationPipe`.
- A service's own primary keys are UUID.
- Cross-service references like `authorId`, `userId`, `followerId`, `followingId` are opaque `String` values without cross-service foreign keys.

## Prisma Stack
- `users`, `blog`, `notify`, and `file-storage` use Prisma 7 with PostgreSQL.
- Generator is `prisma-client`, not `prisma-client-js`.
- Generator output is required and points to `apps/<app>/src/generated/prisma`.
- Generated Prisma clients are git-ignored and eslint-ignored.
- Prisma `datasource db` has no `url`; Prisma 7 forbids it in schema.
- CLI connection config lives in `apps/<app>/prisma.config.ts`.
- `prisma.config.ts` explicitly loads `apps/<app>/.env` with `dotenv`.
- Runtime client requires `@prisma/adapter-pg`.
- `PrismaService extends PrismaClient` and constructs `new PrismaPg({ connectionString })`.
- `PrismaModule` is global and exports `PrismaService`.
- Repositories map Prisma records to shared domain classes.

## Users Service
- Prisma schema: `apps/users/prisma/schema.prisma`.
- Runtime Prisma wrapper: `apps/users/src/app/prisma/`.
- User table: `public.users`.
- User id is UUID: `String @id @default(uuid()) @db.Uuid`.
- Email is unique.
- Password is stored only as `password_hash`.
- `UserIdParamDto` validates ids with `@IsUUID('4')`.
- `POST /auth/login` returns `accessToken` and `refreshToken`.
- Seed file: `apps/users/prisma/seed.ts`.
- `npx nx db-fill users` creates 3 demo users.
- Demo users use password `secret123`.
- In WebStorm Database panel connect to `localhost:5434`, database `readme-users`, schema `public`, table `users`.

## Blog Service
- Prisma schema: `apps/blog/prisma/schema.prisma`.
- Runtime Prisma wrapper: `apps/blog/src/app/prisma/`.
- Posts use single-table inheritance: one `posts` table with `type` enum and nullable type-specific columns.
- `likesCount` and `commentsCount` come from Prisma `_count`; do not maintain counters manually.
- Tags are many-to-many and normalized to lowercase in service logic.
- Feed uses `subscriptions` plus current user's own posts.
- `authorId`, `userId`, `followerId`, `followingId`, and `originalAuthorId` are opaque user ids from Users.
- `apps/blog/blog.http` has REST Client smoke examples.

## Notify Service
- Prisma schema: `apps/notify/prisma/schema.prisma` (tables `email_subscribers`, `notify_posts`).
- Runtime Prisma wrapper: `apps/notify/src/app/prisma/`.
- Hybrid app (`main.ts`): HTTP server plus a RabbitMQ microservice (`Transport.RMQ`, `noAck: true`) bound to the queue `RABBITMQ_QUEUE` (default `readme.notify.income`).
- Consumers (`@EventPattern`): `add.subscriber` upserts `email_subscribers`; `add.post` upserts `notify_posts`. Routing keys are the shared `RabbitRouting` enum in `@project/shared-types`. `blog` is the `add.post` producer (see its `notify-client/` feature); `users` does not yet publish `add.subscriber`.
- The only synchronous endpoint is `POST /api/newsletters`: emails every subscriber a digest of posts where `notifiedAt IS NULL`, then marks them notified ("publications since the last newsletter", §7.3/§7.5).
- Mail: `@nestjs-modules/mailer` (+ `nodemailer`) sends to Mailpit; the HTML digest is built in `mail.service.ts`.
- Internal event payloads are trusted (the global `ValidationPipe`/`DomainExceptionFilter` are not inherited by the consumer); `publishedAt` is coerced to `Date` in the repository.
- Seed: `apps/notify/prisma/seed.ts`; `npx nx db-fill notify` creates 3 demo subscribers (matching the Users demo emails).
- Manual test publisher (no `users`/`blog` needed): `tsx apps/notify/tools/rabbit-publish.ts`. REST Client smoke in `apps/notify/notify.http`.
- In WebStorm Database panel connect to `localhost:5435`, database `readme-notify`, schema `public`.

## File-Storage Service
- Prisma schema: `apps/file-storage/prisma/schema.prisma` (table `files`).
- Runtime Prisma wrapper: `apps/file-storage/src/app/prisma/`.
- Stores file metadata in Postgres (`files` table, UUID PK) and binaries on the filesystem under `UPLOAD_DIRECTORY_PATH` (default `apps/file-storage/uploads`, resolved against `process.cwd()` so `nx serve` from `project/` works).
- Upload endpoints: `POST /api/files/avatar` (≤ 500 КБ) and `POST /api/files/photo` (≤ 1 МБ). Both jpeg/png only, validated by magic bytes via `FileTypeValidator` (Nest 11 default uses `file-type@21.3.4` on `file.buffer`; multer memory storage — do not switch to disk storage). `MaxFileSizeValidator` runs first, `FileTypeValidator` second.
- `GET /api/files/:fileId` returns the metadata RDO (`FileRdo`) plus a ready absolute `url`. `FileIdParamDto` validates with `@IsUUID('4')` to avoid Prisma P2023 on non-uuid input.
- Statics served through `app.useStaticAssets` (`NestExpressApplication`) under the prefix `STATIC_SERVE_ROOT` (default `/static`), outside the `api` global prefix. No `@nestjs/serve-static` dependency.
- `FileService` detects mimetype from the buffer's magic bytes (not from `file.mimetype`), builds a posix `subDirectory` `<kind>/<YYYY>/<MM>` (only `/`, used for both DB and URL), writes the file via `node:fs/promises`, and on a DB failure best-effort `unlink`s the orphan and rethrows. The `url` is built by the service (`${baseUrl}${serveRoot}/${path}`), not the controller.
- `StorageConfig` (`registerAs` `storage`) holds `uploadDirectory`, `serveRoot`, `baseUrl`; `env.validation.ts` uses `@IsUrl({ require_tld: false })` for `STATIC_BASE_URL` so `http://localhost:3004` validates.
- Magic numbers: app `3004`, Postgres `5436`, pgAdmin `8085`.
- No seed (no `db-fill` target). Sample fixtures in `apps/file-storage/sample/`; REST Client smoke in `apps/file-storage/file-storage.http`.
- In WebStorm Database panel connect to `localhost:5436`, database `readme-file-storage`, schema `public`, table `files`.

## Known Gaps
- Blog still uses `STUB_USER_ID`; real auth/ownership should come later via JWT/API Gateway integration.
- Some stub files still exist, for example `apps/users/src/app/user/dto/update-user.dto.ts` and `apps/blog/src/app/post/dto/update-post.dto.ts`.
- Blog update endpoint still has one lint warning because `@Body() dto: any` is used.

## Gotchas
- Numeric env vars need explicit `: number` types in `EnvironmentVariables`, otherwise SWC decorator metadata may not convert strings correctly.
- Post create DTO `type` fields must have validators like `@Equals(PostType.X)`, otherwise `ValidationPipe({ whitelist: true })` strips them.
- Local Postgres on `5432` can conflict with Docker. `blog` uses host port `5433`; `users` `5434`; `notify` `5435`; `file-storage` app `3004`, Postgres `5436`, pgAdmin `8085`. `notify` also exposes RabbitMQ `5672`/`15672`, Mailpit `1025`/`8025`, and pgAdmin `8084`.
- pgAdmin rejects reserved domains like `admin@readme.local`; use `admin@readme.com`.
- `@IsUrl()` defaults reject `http://localhost:...` URLs — needs `require_tld: false` (set in `file-storage` env validation for `STATIC_BASE_URL`). Downstream DTOs in `users` (`avatarUrl`) and `blog` (`photoUrl`) still use the default and will reject localhost URLs — fix in a future integration task.
- `FileTypeValidator` (Nest 11) validates by magic bytes via `file-type@21.3.4` on `file.buffer`; needs multer memory storage (the default — do not switch to disk storage). The regex matches the *detected* mime (`image/jpeg`, not `image/jpg`).
- `apps/<app>/tsconfig.app.json` intentionally includes `prisma.config.ts` and `prisma/**/*.ts` so `import.meta` in Prisma scripts compiles.
- `.env` files are local and ignored by git. Recreate them manually when needed.
- Old local Mongo data may still exist under ignored `apps/users/mongodb/`; it is no longer used.

## Local Infra
- Users Postgres: `docker compose -f apps/users/compose.yaml up -d`
- Users DB: `localhost:5434`, database `readme-users`, user `admin`, password `test`
- Users pgAdmin: `http://localhost:8083`, login `admin@readme.com`, password `test`
- Blog Postgres: `docker compose -f apps/blog/compose.yaml up -d`
- Blog DB: `localhost:5433`, database `readme-blog`, user `admin`, password `test`
- Blog pgAdmin: `http://localhost:8082`
- Notify infra: `docker compose -f apps/notify/compose.yaml up -d`
- Notify RabbitMQ: AMQP `localhost:5672`, management UI `http://localhost:15672`, login `admin` / `test`
- Notify DB: `localhost:5435`, database `readme-notify`, user `admin`, password `test`
- Notify pgAdmin: `http://localhost:8084`
- Notify Mailpit: SMTP `localhost:1025`, web UI `http://localhost:8025`
- File-storage Postgres: `docker compose -f apps/file-storage/compose.yaml up -d`
- File-storage DB: `localhost:5436`, database `readme-file-storage`, user `admin`, password `test`
- File-storage pgAdmin: `http://localhost:8085`
- If containers were renamed from older Mongo setup, use `docker compose -f apps/users/compose.yaml up -d --remove-orphans`.
- If Postgres ignores changed credentials, the data dir was already initialized. Stop compose, remove `apps/<app>/postgres`, then start again.

## Local Env Examples
Users `.env`:

```env
APPLICATION_NODE_ENV=development
APPLICATION_PORT=3001

POSTGRES_HOST=localhost
POSTGRES_PORT=5434
POSTGRES_USER=admin
POSTGRES_PASSWORD=test
POSTGRES_DB=readme-users

PGADMIN_DEFAULT_EMAIL=admin@readme.com
PGADMIN_DEFAULT_PASSWORD=test
PGADMIN_PORT=8083

JWT_ACCESS_TOKEN_SECRET=users-dev-access-token-secret-change-me
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_SECRET=users-dev-refresh-token-secret-change-me
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

Blog `.env`:

```env
APPLICATION_NODE_ENV=development
APPLICATION_PORT=3002

POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=admin
POSTGRES_PASSWORD=test
POSTGRES_DB=readme-blog

# RabbitMQ producer — connects to notify's broker (apps/notify/compose.yaml)
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=test
RABBITMQ_QUEUE=readme.notify.income

PGADMIN_DEFAULT_EMAIL=admin@readme.com
PGADMIN_DEFAULT_PASSWORD=test
PGADMIN_PORT=8082
```

Notify `.env`:

```env
APPLICATION_NODE_ENV=development
APPLICATION_PORT=3003

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=test
RABBITMQ_DEFAULT_VHOST=/

RABBITMQ_USER=admin
RABBITMQ_PASSWORD=test
RABBITMQ_QUEUE=readme.notify.income

POSTGRES_HOST=localhost
POSTGRES_PORT=5435
POSTGRES_USER=admin
POSTGRES_PASSWORD=test
POSTGRES_DB=readme-notify

PGADMIN_DEFAULT_EMAIL=admin@readme.com
PGADMIN_DEFAULT_PASSWORD=test
PGADMIN_PORT=8084

MAIL_SMTP_HOST=localhost
MAIL_SMTP_PORT=1025
MAIL_UI_PORT=8025
MAIL_FROM=no-reply@readme.local
```

File-storage `.env`:

```env
APPLICATION_NODE_ENV=development
APPLICATION_PORT=3004

POSTGRES_HOST=localhost
POSTGRES_PORT=5436
POSTGRES_USER=admin
POSTGRES_PASSWORD=test
POSTGRES_DB=readme-file-storage

PGADMIN_DEFAULT_EMAIL=admin@readme.com
PGADMIN_DEFAULT_PASSWORD=test
PGADMIN_PORT=8085

UPLOAD_DIRECTORY_PATH=apps/file-storage/uploads
STATIC_SERVE_ROOT=/static
STATIC_BASE_URL=http://localhost:3004
```

## Git
- Branch per course task, for example `moduleN-taskM`.
- Check current branch with `git branch --show-current`.
- Do not commit to `master`.
