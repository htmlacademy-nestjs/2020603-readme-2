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
- Build one app: `npx nx build users` or `npx nx build blog`
- Lint one app: `npx nx lint users` or `npx nx lint blog`
- Lint all: `npx nx run-many -t lint`
- Test one app: `npx nx test users` or `npx nx test blog`
- Test all: `npx nx run-many -t test`
- Focused Jest test: `npx nx test users -t "<name>"` or `npx nx test blog -t "<name>"`
- Inspect targets: `npx nx show project users` or `npx nx show project blog`
- Prisma validate: `npx nx db-validate users` or `npx nx db-validate blog`
- Prisma generate: `npx nx db-generate users` or `npx nx db-generate blog`
- Prisma migrate: `npx nx db-migrate users --name <name>` or `npx nx db-migrate blog --name <name>`
- Prisma reset: `npx nx db-reset users` or `npx nx db-reset blog`
- Prisma seed: `npx nx db-fill users` or `npx nx db-fill blog`

## Verification Status
- `npx nx build <app>` works and is the main compile check.
- `npx nx test <app>` works with Jest 30 via SWC.
- `npx nx lint users` is clean.
- `npx nx lint blog` passes with one known warning in `apps/blog/src/app/post/post.controller.ts` for `update(@Body() dto: any)`.
- `npx nx typecheck <app>` is still a known problem: inferred Nx target runs `tsc --build --emitDeclarationOnly`, while workspace aliases map `@project/*` to lib source without TS project references. Use `nx build` and `nx test` as verification until a project-references migration is done.
- `users` and `blog` both use Prisma DB targets. `db-validate` and `db-generate` do not need a running DB. `db-migrate`, `db-reset`, and `db-fill` need Postgres up.

## Apps
- `users`: Prisma + PostgreSQL service. Implements registration, login, JWT access/refresh tokens, password change, Prisma-backed user repository, UUID primary keys, bcrypt password hashes.
- `blog`: Prisma + PostgreSQL service. Implements posts, comments, likes, subscriptions, feed, filtering, search, pagination, and RDO serialization. It still uses `STUB_USER_ID` instead of real auth/API Gateway integration.
- `file-storage`: scaffold. A `file/` module exists but is not imported into `app.module.ts`.
- `notify`: empty Nx scaffold.
- No `*-e2e` apps exist, though `nx.json` still lists them in Jest excludes.

## Shared Libs
- `@project/shared-types`: domain classes/enums/interfaces (`User`, post union types, `Comment`, `Like`, `PostType`, `TokenPayload`, `PaginationResult`, etc.).
- `@project/shared-errors`: domain error base classes and `DomainExceptionFilter`.
- `@project/shared-config`: `validateEnvironment(schema, config)`.

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
- Both `users` and `blog` use Prisma 7 with PostgreSQL.
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

## Known Gaps
- Blog still uses `STUB_USER_ID`; real auth/ownership should come later via JWT/API Gateway integration.
- Some stub files still exist, for example `apps/users/src/app/user/dto/update-user.dto.ts` and `apps/blog/src/app/post/dto/update-post.dto.ts`.
- Blog update endpoint still has one lint warning because `@Body() dto: any` is used.

## Gotchas
- Numeric env vars need explicit `: number` types in `EnvironmentVariables`, otherwise SWC decorator metadata may not convert strings correctly.
- Post create DTO `type` fields must have validators like `@Equals(PostType.X)`, otherwise `ValidationPipe({ whitelist: true })` strips them.
- Local Postgres on `5432` can conflict with Docker. `blog` uses host port `5433`; `users` uses host port `5434`.
- pgAdmin rejects reserved domains like `admin@readme.local`; use `admin@readme.com`.
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

PGADMIN_DEFAULT_EMAIL=admin@readme.com
PGADMIN_DEFAULT_PASSWORD=test
PGADMIN_PORT=8082
```

## Git
- Branch per course task, for example `moduleN-taskM`.
- Check current branch with `git branch --show-current`.
- Do not commit to `master`.
