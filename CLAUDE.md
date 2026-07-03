<!-- CLAUDE.md — guidance for Claude Code (claude.ai/code) when working in this repo. Distilled from AGENTS.md. -->

# CLAUDE.md

HTML Academy "Readme" course: NestJS 11 + Nx 22 monorepo, ESM (`"type": "module"`), Node 20+.

## Critical Layout
- **All code lives in `project/`. Run every `npm`, `nx`, `prisma`, and `docker compose` command from `project/`** — not the repo root.
- Repo root holds only course docs (`Readme.md`, `Workflow.md`, `Contributing.md`, `specification.md`), `markup/`, and `AGENTS.md`.
- `project/package.json` has empty `scripts: {}`. **Ignore `Workflow.md` `npm run` commands; use Nx targets.**
- `.github/workflows/check.yml` is stale/no-op (expects a root `package.json`). Verify locally.

## Commands (run from `project/`)
- Install: `npm install`
- Serve: `npx nx serve users` | `npx nx serve blog`
- Build: `npx nx build <app>` — **main compile check**
- Lint: `npx nx lint <app>` | all: `npx nx run-many -t lint`
- Test: `npx nx test <app>` | all: `npx nx run-many -t test` | focused: `npx nx test <app> -t "<name>"`
- Inspect targets: `npx nx show project <app>`
- Prisma (no DB needed): `npx nx db-validate <app>`, `npx nx db-generate <app>`
- Prisma (DB required): `npx nx db-migrate <app> --name <name>`, `npx nx db-reset <app>`, `npx nx db-fill <app>`

## Verification
- **Verify with `nx build` and `nx test`, not `nx typecheck`.** `typecheck` is broken: inferred target runs `tsc --build --emitDeclarationOnly`, but `@project/*` aliases map to lib source without TS project references.
- `nx lint users` is clean. `nx lint blog` passes with one known warning (`@Body() dto: any` in `apps/blog/src/app/post/post.controller.ts`).
- Jest 30 runs via SWC. No `*-e2e` apps exist despite `nx.json` excludes.

## Apps
- **`users`**: Prisma + PostgreSQL. Registration, login, JWT access/refresh, password change, UUID PKs, bcrypt hashes.
- **`blog`**: Prisma + PostgreSQL. Posts, comments, likes, subscriptions, feed, filtering, search, pagination, RDO serialization. Still uses `STUB_USER_ID` (no real auth yet). **Publishes `add.post` to notify's RabbitMQ queue** on post create/repost via `notify-client/` (`ClientProxy.emit`).
- **`file-storage`**: scaffold; `file/` module not imported into `app.module.ts`.
- **`notify`**: Prisma + PostgreSQL. Email newsletters (§7). Hybrid app: RabbitMQ consumer (`@EventPattern` `add.subscriber`/`add.post`) + one sync HTTP trigger `POST /api/newsletters`; mail via `@nestjs-modules/mailer` → mailpit. `blog` publishes `add.post`; `users` doesn't publish `add.subscriber` yet.

## Shared Libs (import via aliases, never relative paths)
- `@project/shared-types`: domain classes/enums/interfaces (`User`, post unions, `Comment`, `Like`, `PostType`, `TokenPayload`, `PaginationResult`) + RabbitMQ contract shared by producers/consumer (`RabbitRouting` enum, `PostNotification`).
- `@project/shared-errors`: domain error base classes + `DomainExceptionFilter`.
- `@project/shared-config`: `validateEnvironment(schema, config)`.

## Coding Rules
- ESM project: use `.js` suffix in runtime ESM imports where required by generated/runtime scripts.
- Prettier: single quotes, 2-space indent, LF, final newline.
- **Per-feature files**: `<feature>.controller.ts`, `.service.ts`, `.module.ts`, `.repository.ts`, constants/errors, `dto/`, `rdo/`.
- Feature modules declare their controller/service/repository and are imported into `app.module.ts`.
- **DTOs** = input contracts: `class-validator` + `@ApiProperty`.
- **RDOs** = output contracts: `class-transformer` `@Expose`.
- Controllers serialize via `plainToInstance(...)` or helpers `fillRdo` / `fillRdoList` / `fillRdoPagination`.
- **Services throw domain errors from feature `*.errors.ts`, never raw Nest HTTP exceptions.**
- `main.ts`: register `DomainExceptionFilter`, global prefix `api`, Swagger at `/spec`, strict `ValidationPipe`.
- A service's own PKs are UUID. Cross-service refs (`authorId`, `userId`, `followerId`, `followingId`) are opaque `String`, no cross-service FKs.

## Prisma Stack
- Prisma 7 + PostgreSQL on `users`, `blog`, and `notify`.
- Generator is `prisma-client` (not `prisma-client-js`); output points to `apps/<app>/src/generated/prisma` (git- and eslint-ignored).
- `datasource db` has **no `url`** (forbidden in Prisma 7). CLI config lives in `apps/<app>/prisma.config.ts`, which loads `apps/<app>/.env` via `dotenv`.
- Runtime needs `@prisma/adapter-pg`. `PrismaService extends PrismaClient`, constructs `new PrismaPg({ connectionString })`. `PrismaModule` is global and exports `PrismaService`.
- Schema files: `apps/<app>/prisma/schema.prisma` only — no per-feature schema files. Repositories map Prisma records to shared domain classes.

### Users
- Table `public.users`; id `String @id @default(uuid()) @db.Uuid`; email unique; password only as `password_hash`.
- `UserIdParamDto` validates with `@IsUUID('4')`. `POST /auth/login` returns `accessToken` + `refreshToken`.
- Seed `apps/users/prisma/seed.ts`; `db-fill users` creates 3 demo users, password `secret123`.

### Blog
- Single-table inheritance: one `posts` table with `type` enum + nullable type-specific columns.
- `likesCount`/`commentsCount` come from Prisma `_count` — **do not maintain counters manually**.
- Tags are many-to-many, normalized to lowercase in service logic. Feed = subscriptions + own posts.
- `authorId`, `userId`, `followerId`, `followingId`, `originalAuthorId` are opaque Users ids.
- Smoke examples in `apps/blog/blog.http`.

## Gotchas
- Numeric env vars need explicit `: number` types in `EnvironmentVariables`, else SWC decorator metadata mis-converts strings.
- Post create DTO `type` fields need validators like `@Equals(PostType.X)`, else `ValidationPipe({ whitelist: true })` strips them.
- Host ports: `blog` Postgres `5433`, `users` Postgres `5434`, `notify` Postgres `5435` (avoid local `5432` conflict). `notify` also: RabbitMQ `5672`/`15672`, Mailpit `1025`/`8025`, pgAdmin `8084`.
- pgAdmin rejects reserved domains (`admin@readme.local`); use `admin@readme.com`.
- `tsconfig.app.json` intentionally includes `prisma.config.ts` and `prisma/**/*.ts` so `import.meta` compiles.
- `.env` files are git-ignored — recreate manually. Old Mongo data under `apps/users/mongodb/` is unused.

## Local Infra
- Users: `docker compose -f apps/users/compose.yaml up -d` → DB `localhost:5434` `readme-users` (admin/test), pgAdmin `http://localhost:8083`.
- Blog: `docker compose -f apps/blog/compose.yaml up -d` → DB `localhost:5433` `readme-blog` (admin/test), pgAdmin `http://localhost:8082`.
- Notify: `docker compose -f apps/notify/compose.yaml up -d` → RabbitMQ AMQP `localhost:5672` + UI `http://localhost:15672` (admin/test), DB `localhost:5435` `readme-notify` (admin/test), pgAdmin `http://localhost:8084`, Mailpit SMTP `localhost:1025` + UI `http://localhost:8025`.
- Renamed-from-Mongo containers: add `--remove-orphans`. Credential changes ignored → stop compose, remove `apps/<app>/postgres`, restart.

## Git
- **Never commit to `master`.** Branch per task: `moduleN-taskM`. Check with `git branch --show-current`.
