<!-- CLAUDE.md — guidance for Claude Code (claude.ai/code) when working in this repo. Distilled from AGENTS.md. -->

# CLAUDE.md

HTML Academy "Readme" course: NestJS 11 + Nx 22 monorepo, ESM (`"type": "module"`), Node 20+.

## Critical Layout
- **All code lives in `project/`. Run every `npm`, `nx`, `prisma`, and `docker compose` command from `project/`** — not the repo root.
- Repo root holds only course docs (`Readme.md`, `Workflow.md`, `Contributing.md`, `specification.md`), `markup/`, and `AGENTS.md`.
- `project/package.json` has empty `scripts: {}`. **Ignore `Workflow.md` `npm run` commands; use Nx targets.**
- `.github/workflows/check.yml` is stale/no-op (expects a root `package.json`). Verify locally.

## Commands (run from `project/`)
- Install: `npm install`. `package-lock.json` must list every workspace (`apps/*`); check with `npm ci` — it failed until the lockfile got the missing `@project/api-gateway` entry.
- Serve: `npx nx serve users` | `npx nx serve blog` | `npx nx serve notify` | `npx nx serve file-storage` | `npx nx serve api-gateway`
- Build: `npx nx build <app>` (webpack transpiles without type checking — see Verification)
- Lint: `npx nx lint <app>` | all: `npx nx run-many -t lint`
- Test: `npx nx test <app>` | all: `npx nx run-many -t test` | focused: `npx nx test <app> -t "<name>"`
- Inspect targets: `npx nx show project <app>`
- Prisma (no DB needed): `npx nx db-validate <app>`, `npx nx db-generate <app>`
- Prisma (DB required): `npx nx db-migrate <app> --name <name>`, `npx nx db-reset <app>`, `npx nx db-fill <app>`

## Verification
- **Verify with `nx build`, `nx test` and `npx tsc --noEmit -p apps/<app>/tsconfig.app.json`, not `nx typecheck`.** `typecheck` is broken: inferred target runs `tsc --build --emitDeclarationOnly`, but `@project/*` aliases map to lib source without TS project references.
- **`nx build` does not catch type errors** (webpack `compiler: 'tsc'` transpiles only) and Jest/SWC does not type-check specs either. Run `tsc --noEmit -p apps/<app>/tsconfig.app.json` for app code; `tsconfig.spec.json` fails with TS6306 (references a non-composite app config), so check specs with a temporary config that extends it with `"references": []`.
- ESLint enforces `curly: ['error', 'all']` (criterion Б9).
- `nx run-many -t lint` is clean for all 5 apps (the old `@Body() dto: any` warning in blog is gone — the update endpoint now uses `UpdatePostDto`).
- Jest 30 runs via SWC. No `*-e2e` apps exist despite `nx.json` excludes.

## Apps
- **`users`**: Prisma + PostgreSQL. Registration, login, JWT access/refresh, password change, UUID PKs, bcrypt hashes. **Publishes `user.registered` to notify's RabbitMQ queue** on registration via its own `notify-client/` (needs `RABBITMQ_*` in `.env`). `UserService` is the module's public API; `AuthenticationService` never touches `UserRepository`.
- **`blog`**: Prisma + PostgreSQL. Posts, comments, likes, subscriptions, feed, filtering, search, pagination, RDO serialization. **No JWT here** — it trusts the `X-User-Id` header set by the gateway (`common/user-id.guard.ts` + `@RequireUserId()` + `@CurrentUserId()`). Enforces ownership (403 on someone else's post/comment), draft visibility (a draft is 404 for non-authors), published-only likes/comments/reposts, and no self-repost (409). **Publishes `post.published`** on create, repost, return from draft and edits of a published post, and **`post.unpublished`** when a published post becomes a draft or is deleted (`notify-client/`, `ClientProxy.emit`). Posts and comments are **soft-deleted** (`isDeleted` flag + `deletedAt` timestamp).
- **`file-storage`**: Prisma + PostgreSQL (metadata) + filesystem (binaries). Upload/serve files (avatars, photo-posts). Endpoints: `POST /api/files/avatar` (≤ 500 КБ), `POST /api/files/photo` (≤ 1 МБ) — both jpeg/png only, validated by magic bytes (`FileTypeValidator` in Nest 11 uses `file-type@21.3.4` on `file.buffer`, memory storage); `GET /api/files/:fileId` returns metadata + ready absolute `url`. Statics served via `app.useStaticAssets` (`NestExpressApplication`) under `/static` (outside the `api` prefix), no `@nestjs/serve-static` dependency. `FileModule` imported into `AppModule`. Sample fixtures + IntelliJ HTTP Client smoke in `apps/file-storage/file-storage.http`.
- **`notify`**: Prisma + PostgreSQL. Email newsletters (§7). Hybrid app: RabbitMQ consumer (`@EventPattern` `user.registered`, `post.published`, `post.unpublished`) + one sync HTTP trigger `POST /api/newsletters`; mail via `@nestjs-modules/mailer` → mailpit. `post.unpublished` deletes the pending `notify_posts` row, so drafts and deleted posts never reach the digest.
- **`api-gateway`** (port 3005): Stateless presentation layer — no Prisma, no compose, no DB. Locally verifies JWT (`@nestjs/jwt`, secret duplicated from `users` `.env`). Proxies HTTP to the 4 downstream services via `@nestjs/axios`. Aggregates: authors in posts/comments, user cards in subscriptions, profile counts (`postsCount` from blog `totalItems`, `subscribersCount` from blog `followers/:userId/count`). Multipart pass-through: `POST /api/auth/register` (avatar → file-storage → users), `POST /api/posts/photo` (photo → file-storage → blog). `@Catch(AxiosError)` filter passes through downstream status+body; network errors → 503. Passes the authenticated `sub` to blog as the `X-User-Id` header (`BlogClient.buildUserRequestConfig`), so posts/likes/comments/subscriptions belong to the token owner. `AnonymousGuard` blocks registration for authenticated clients (§1.1). Swagger at `/spec` with `.addBearerAuth()`. Needs all 4 services running. Smoke in `apps/api-gateway/api-gateway.http`.

## Shared Libs (import via aliases, never relative paths)
- `@project/shared-types`: domain classes/enums/interfaces (`User`, post unions, `Comment`, `Like`, `PostType`, `PostSortBy`, `TokenPayload`, `PaginationResult`, `PaginationQuery`, `PostQuery`) + domain limits from the spec as const objects (`PostValidation`, `PostTag`, `YoutubeUrl`, `PostListLimit`, `CommentValidation`, `CommentListLimit`, `UserValidation`, `Pagination`, `MaxFileSize`, `ImageMimeType`, `IMAGE_MIME_TYPE_PATTERN`) + RabbitMQ contract shared by producers/consumer (`RabbitRouting` enum, `UserRegisteredEvent`, `PostPublishedEvent`, `PostUnpublishedEvent`) + the cross-service `USER_ID_HEADER` constant (`x-user-id`).
- `@project/shared-errors`: domain error base classes + `DomainExceptionFilter`.
- `@project/shared-config`: `validateEnvironment(schema, config)`, `Environment` enum, env schema base classes `BaseEnvironment` → `PostgresEnvironment` → `PostgresRabbitmqEnvironment` (+ `PortRange`, `JWT_SECRET_MIN_LENGTH`), `registerAs` config factories `appConfig`/`postgresConfig`/`rabbitmqConfig` (+ interfaces; factories are callable directly, e.g. `postgresConfig()` in seeds), and app bootstrap helpers `setupApplication(app, swagger)` / `startApplication(app, name)` / `createValidationPipe()` / `ApplicationPath`.
- `@project/shared-helpers`: `fillRdo`/`fillRdoList`/`fillRdoPagination` (RDO serialization), `createPaginationResult`, `ApiPaginatedResponse` (Swagger), `ValidateTags()` + `normalizeTags` (tags are lowercased and deduplicated **before** validation, so repeated tags never exceed the limit), `createImageFilePipe({ maxSize, isRequired })`, `getPostgresConnectionString`/`getRabbitmqConnectionString`.
- `@project/shared-dto`: request DTOs shared by a service and the gateway (`RegisterUserDto`, `LoginUserDto`, `ChangeUserPasswordDto`, `RefreshTokenDto`, `UserIdParamDto`, `CreateCommentDto`, `GetCommentQueryDto`, `GetPostQueryDto`, `SearchPostQueryDto`, `UpdatePostDto`, and the post content DTOs `Video/Text/Quote/LinkPostContentDto`). Blog's `Create*PostDto` extend the content DTOs and add `type`; the gateway uses the content DTOs directly. Service-specific DTOs stay in the app.
- **Per-app `apps/<app>/src/app/config/` holds only the service's own env schema** (`EnvironmentVariables` extending a shared base class + `validateEnv` in `env.validation.ts`; blog validates `PostgresRabbitmqEnvironment` as is; `APPLICATION_PORT` has no default and must be in `.env`), its `index.ts` barrel, and service-specific `registerAs` config (`jwt.config.ts` in `users`, `mail.config.ts` in `notify`, `storage.config.ts` in `file-storage`, `services.config.ts` + `jwt.config.ts` in `api-gateway`). Shared factories/enum/connection-string helpers come from the libs above — no per-app `helpers/` dir.

## Coding Rules
- **Module boundaries: a module exports only its service.** Repositories and Prisma tables are private to their module; other modules call the service (`AuthenticationService → UserService`, `CommentService`/`LikeService → PostService`, `PostService.findFeed → SubscriptionService.findFollowingIds`). No `*.module.ts` exports a repository.
- **RabbitMQ events are named after what happened at the producer** (`user.registered`, `post.published`), not after what the consumer will do.
- ESM project: use `.js` suffix in runtime ESM imports where required by generated/runtime scripts.
- Prettier: single quotes, 2-space indent, LF, final newline.
- **Per-feature files**: `<feature>.controller.ts`, `.service.ts`, `.module.ts`, `.repository.ts`, constants/errors, `dto/`, `rdo/`.
- Feature modules declare their controller/service/repository and are imported into `app.module.ts`.
- **DTOs** = input contracts: `class-validator` + `@ApiProperty`.
- **RDOs** = output contracts: `class-transformer` `@Expose`.
- Controllers serialize via `plainToInstance(...)` or helpers `fillRdo` / `fillRdoList` / `fillRdoPagination`.
- **Services throw domain errors from feature `*.errors.ts`, never raw Nest HTTP exceptions.**
- `main.ts`: `setupApplication(app, { title, description })` (global prefix `api`, strict `ValidationPipe`, `DomainExceptionFilter`, Swagger at `/spec`) and `startApplication(app, name)` (port from `appConfig.KEY`); called as `void bootstrap()` (webpack bundles CommonJS, no top-level await).
- A service's own PKs are UUID. Cross-service refs (`authorId`, `userId`, `followerId`, `followingId`) are opaque `String`, no cross-service FKs.

## Prisma Stack
- Prisma 7 + PostgreSQL on `users`, `blog`, and `notify`.
- Generator is `prisma-client` (not `prisma-client-js`); output points to `apps/<app>/src/generated/prisma` (git- and eslint-ignored).
- `datasource db` has **no `url`** (forbidden in Prisma 7). CLI config lives in `apps/<app>/prisma.config.ts`, which loads `apps/<app>/.env` via `dotenv`.
- Runtime needs `@prisma/adapter-pg`. `PrismaService extends PrismaClient`, constructs `new PrismaPg({ connectionString })`. `PrismaModule` is global and exports `PrismaService`.
- Schema files: `apps/<app>/prisma/schema.prisma` only — no per-feature schema files. Repositories map Prisma records to shared domain classes.
- **`db-migrate` does NOT generate the client** under Prisma 7 + `prisma.config.ts` (verified on a clean clone). After a fresh checkout run `npx nx db-generate <app>` for all four Prisma apps, otherwise `nx build` fails with `Can't resolve '../../generated/prisma/client'`.

### Users
- Table `public.users`; id `String @id @default(uuid()) @db.Uuid`; email unique; password only as `password_hash`.
- `UserIdParamDto` validates with `@IsUUID('4')`. User details live in `UserController`: `GET /api/users/:id` (not under `/auth`). `POST /auth/login` returns `accessToken` + `refreshToken`; `POST /auth/refresh` exchanges a refresh token for a new pair. Login answers an unknown email and a wrong password with the same 401 `InvalidCredentialsError` («Неверный email или пароль») — a 404 for the email would reveal who is registered. `UserModule` exports only `UserService` (`getById` throws `UserNotFoundError`, `create` enforces unique email with `UserAlreadyExistsError`; both errors live in `user/user.errors.ts`).
- Seed `apps/users/prisma/seed.ts`; `db-fill users` creates 3 demo users, password `secret123`.
- **Seeds and `apps/notify/tools/*.ts` run through `tsx --tsconfig tsconfig.scripts.json`** (seed commands in `apps/<app>/prisma.config.ts`). tsx applies a tsconfig only to files in its `include`, and the root `tsconfig.json` has `files: []`, so without `tsconfig.scripts.json` the class-validator field decorators in `libs/shared-config` compile as TC39 decorators and crash (`Cannot read properties of undefined (reading 'constructor')`). tsx also runs these files as CommonJS (`apps/*/package.json` has no `"type"`): **no top-level `await`** — the entry point is `async function run()` + `void run()`. Seeds are re-runnable (`clean()` first).

### Blog
- Single-table inheritance: one `posts` table with `type` enum + nullable type-specific columns.
- `PostRepository.save` writes `createdAt` taken from the service, so on create `createdAt === publishedAt` exactly (§2.11); the DB `default(now())` was a few ms later.
- Likes: a second like is 409, removing a like that was not given is 404 (`LikeNotFoundError`, §5.3 — «забрать ранее оставленный»), consistent with unsubscribe and comment delete.
- `likesCount`/`commentsCount` come from Prisma `_count` — **do not maintain counters manually**. `commentsCount` is a filtered count (`comments: { where: { isDeleted: false } }`), so it ignores soft-deleted comments.
- **Soft delete**: `Post` and `Comment` have an `isDeleted` flag and a `deletedAt` timestamp. The flag decides: every read filters `isDeleted: false` (`NOT_DELETED` from `prisma/soft-delete.constant.ts`); `softDeleteById` sets both fields. A restore would reset only the flag and keep the date. **Do not collapse the flag back into `deletedAt IS NULL`** — the mentor asked for both fields so that restoring never erases the deletion date. Migration `soft_delete_flag` backfills `is_deleted` from `deleted_at`. Comments of a deleted post are not marked separately — they become unreachable with the post (§2.3) because every comment operation checks the post first (`getPublishedById`); deleting a comment also requires it to belong to `:postId`, otherwise 404. Likes and subscriptions stay hard-deleted on purpose: they are toggles with no dependents. Reposts of a deleted original stay visible and keep `originalPostId`.
- **Sort by comments is two-phase** (`PostRepository.findPageByCommentsCount`): Prisma cannot `orderBy` a filtered relation count, so posts with live comments come from `comment.groupBy` ordered by count, then posts without live comments by `publishedAt`. Do not switch it back to `orderBy: { comments: { _count } }` — that counts deleted comments.
- Tags are many-to-many, normalized to lowercase in service logic. Feed = subscriptions + own posts.
- `authorId`, `userId`, `followerId`, `followingId`, `originalAuthorId` are opaque Users ids.
- New endpoint `GET /api/subscriptions/followers/:userId/count` → `{ count }` (added for API Gateway profile aggregation).
- Protected routes use `@RequireUserId()` (guard + Swagger header) and read the id via `@CurrentUserId()`. Public: post list, single post, search, comment list, followers count.
- `PostService.getById(id, requesterId?)` hides other people's drafts behind 404; `getPublishedById(id)` is the gate for likes, comments and reposts.
- Tag rules live in `PostTag` (`@project/shared-types`) and are applied with `@ValidateTags()` in every create/update DTO.
- `YoutubeUrl.Pattern` (§2.5) accepts every single-video link YouTube hands out: `youtube.com/watch?v=ID` (`www.`/`m.`, `v` anywhere in the query, extra params like `&t=30s`), `youtu.be/ID`, `/shorts/ID`, `/embed/ID`, `/live/ID`. The ID must be exactly 11 chars `[\w-]`; channels, playlists and look-alike hosts are rejected. Cases are listed in `post-dto.validation.spec.ts`.
- Path ids (`:id`, `:postId`) go through `ParseUUIDPipe` — a malformed id is 400, not a Prisma `P2007` 500.
- List ordering always ends with a unique tiebreaker (`LATEST_FIRST = [{ publishedAt: 'desc' }, { id: 'asc' }]`, comments `[{ createdAt }, { id }]`): without it, equal sort keys made OFFSET pages repeat or skip posts.
- `UpdatePostDto` is fully validated and also carries `publishedAt` (§2.11) and `status` (§2.12). `PostService.update` merges only defined fields — compiled DTOs carry `undefined` own properties.
- Search matches individual words (`OR` over `contains`), not the whole phrase (§8.2).
- Smoke examples in `apps/blog/blog.http`.

### API Gateway
- Stateless (port 3005): no Prisma, no compose, no DB. `JWT_ACCESS_TOKEN_SECRET` must match `apps/users/.env` byte-for-byte.
- `@nestjs/axios` (`HttpModule.registerAsync`) proxies to 4 downstream services. `ClientsModule` imports `HttpModule` and exports only the 4 clients. `@Catch(AxiosError)` filter passes through status+body; network errors → 503.
- `JwtAuthGuard` verifies Bearer locally; `@CurrentUser('sub')` gives user id. `@ApiBearerAuth()` on protected routes.
- Author enrichment: `UsersClient.attachAuthors(items)` (built on `getInfoMap(ids)`) — errors and non-UUID ids → `null` (non-UUID ids skip the request: users would answer 400). Nested RDOs need `@Type(() => UserInfoRdo)`.
- Subscribing checks the target first (`UsersClient.getById`): an unknown user is 404 and no subscription is created; `followingId` is `@IsUUID('4')`.
- Multipart pass-through: register (avatar → file-storage → users), photo post (photo → file-storage → blog). Limits come from `MaxFileSize` via `createImageFilePipe`.
- Gateway create endpoints take the shared content DTOs (no `type`); `PostsService.create(userId, type, dto)` adds it before calling blog. `UpdatePostDto` is all-optional.
- `GET /api/users/:id` aggregates `postsCount` (blog `totalItems`) + `subscribersCount` (blog `followers/:userId/count`).
- `BlogClient.buildUserRequestConfig(userId)` adds the `X-User-Id` header to every user-scoped blog call; controllers take `@CurrentUser('sub')` and pass it into the services.
- `AnonymousGuard` (`common/anonymous.guard.ts`) rejects registration when a valid Bearer token is present → `AlreadyAuthenticatedError` (403). `OptionalJwtAuthGuard` keeps `GET /api/posts/:id` public but fills `request.user` when a token is supplied, so an author can open their own draft by id. `POST /api/auth/refresh` proxies to users.
- Cross-app imports are forbidden: anything two services share (constants, DTOs, helpers) goes into a `libs/shared-*` library. Smoke in `apps/api-gateway/api-gateway.http`.

## HTTP Smoke Files
- `*.http` are **IntelliJ HTTP Client** files, not VS Code REST Client — the dialects are not interchangeable.
- Chain response values with `> {% client.global.set('postId', response.body.id); %}` and use `{{postId}}`. **Never** `{{createPost.response.body.id}}` — that is REST Client syntax and WebStorm reports `Cannot resolve variable`.
- Each app ships `http-client.env.json` with a `development` environment. The per-file selection lives in git-ignored `.idea/workspace.xml`; if the selected environment is missing, **every** variable in the file is flagged, in-place ones included.
- In-place `@name = value` beats environment values, so static values are intentionally duplicated in both places. Keep them in sync.
- `blog.http` subscribes `userId` to `notFollowedUserId` (Павел), not to `otherUserId`: the seed already has `userId → otherUserId`, so that pair gave 409 on fresh demo data and the file's unsubscribe deleted the demo subscription.
- **Smoke files must survive a re-run against the same DB — never hard-code a registration email.** `api-gateway.http` registers `alice-{{$random.alphanumeric(8)}}@example.com` and saves the address from the response (`client.global.set('email', response.body.email)`); login and the 409 duplicate check use `{{email}}` / `{{secondEmail}}`. A fixed email returns 409 on the second run, `userId` stays unset and every `{{userId}}` URL fails.
- Check a file without the IDE: `docker run --rm -v "$PWD:/workdir" jetbrains/intellij-http-client -D -e development -v /workdir/apps/blog/http-client.env.json /workdir/apps/blog/blog.http`

## Gotchas
- Numeric env vars need explicit `: number` types in the env schema classes, else decorator metadata mis-converts strings.
- `notify` connects the RMQ microservice with `{ inheritAppConfig: true }`, so the global `ValidationPipe` validates event payloads (and turns `publishedAt` into `Date`). Invalid events are dropped **silently**: in Nest 11 `HttpException` extends `IntrinsicException`, which the RPC exception filter does not log.
- **`MAIL_SMTP_HOST=127.0.0.1`, not `localhost`.** nodemailer resolves hosts with `dns.resolve4/resolve6` (a DNS query, not `/etc/hosts`): `localhost` took ~750 ms per lookup, results are cached only 5 min, so a cold newsletter to 35 subscribers took 7–9 s and the gateway (5 s `HTTP_CLIENT_TIMEOUT`) answered 503 although the mail went out. The transport also uses `pool: true` so a newsletter reuses a few connections instead of one per recipient.
- Post create DTO `type` fields need validators like `@Equals(PostType.X)`, else `ValidationPipe({ whitelist: true })` strips them.
- Host ports: `blog` Postgres `5433`, `users` Postgres `5434`, `notify` Postgres `5435`, `file-storage` app `3004` / Postgres `5436` / pgAdmin `8085` (avoid local `5432` conflict). `notify` also: RabbitMQ `5672`/`15672`, Mailpit `1025`/`8025`, pgAdmin `8084`. `api-gateway` app `3005` (stateless, no DB/compose).
- `@IsUrl()` defaults reject `http://localhost:...` URLs — needs `require_tld: false`. Fixed: `file-storage` (`STATIC_BASE_URL`), `users` (`avatarUrl`), `blog` (`photoUrl`), and `api-gateway` (all `*_SERVICE_URL`). Gateway's `UpdatePostDto` also uses `require_tld: false` for `photoUrl`/`link`.
- `FileTypeValidator` (Nest 11) validates by magic bytes via `file-type@21.3.4` on `file.buffer`; needs multer memory storage (the default — do not switch to disk storage). Regex matches the *detected* mime (`image/jpeg`, not `image/jpg`).
- pgAdmin rejects reserved domains (`admin@readme.local`); use `admin@readme.com`.
- `tsconfig.app.json` intentionally includes `prisma.config.ts` and `prisma/**/*.ts` so `import.meta` compiles.
- `.env` files are git-ignored — copy from the per-app `.env.example`. Old Mongo data under `apps/users/mongodb/` is unused.
- Builds use tsc with `target: es2023`, so declared-but-unset DTO fields exist as own `undefined` properties. Never `Object.assign` a DTO onto a domain object without filtering them out.

## Full Docker Stack (for reviewers)
- `project/compose.yaml` (`name: readme`) runs everything: 4× `postgres:18`, RabbitMQ, Mailpit and the 5 services. Start from `project/`: `docker compose up -d --build --wait`. Documented in root `Readme.md` and `specification.md` («Быстрый запуск в Docker»). The per-app `apps/<app>/compose.yaml` files stay for local development (infra only).
- One image `readme-app` (`project/Dockerfile`, `node:24-bookworm-slim` + `openssl` for the Prisma CLI): `npm ci`, `nx run-many -t db-generate`, `nx run-many -t build`. Entry point `sh docker/start.sh <app>`: `prisma migrate deploy`, then `prisma db seed` only on the first start (marker `/app/state/<app>.seeded` in the `seed-state` volume), then `exec node apps/<app>/dist/main.js`. A restart keeps data; `docker compose down -v` drops DBs and markers together, so the next `up` reseeds.
- No `.env` in containers: services read `env_file: apps/<app>/.env.example` (missing `apps/<app>/.env` is skipped by `ConfigModule`), compose overrides only hosts (`POSTGRES_HOST`/`POSTGRES_PORT=5432`, `RABBITMQ_HOST`, `MAIL_SMTP_HOST=mailpit`, gateway `*_SERVICE_URL=http://<service>:<port>/api`). `STATIC_BASE_URL` stays `http://localhost:3004` because clients open those URLs from the host.
- Healthchecks: app containers `fetch` their own `/spec` (no `${}` in compose strings — compose would interpolate it); the gateway waits for the 4 services to be healthy. Host ports 3001–3005, 8025, 15672; DB ports are not published. Running it next to the dev infra containers clashes on 8025/15672.
- `project/.dockerignore` keeps the build context to sources (~1.4 MB): no `node_modules`, `dist`, generated Prisma clients, `.env` or `apps/*/postgres` data. `project/.gitattributes` forces LF for `*.sh` and `.env.example` so a Windows checkout does not break `sh` or env values.
- Verified: build ~2 min, cold `up --wait` ~20 s with the image cached, spec checks 232/232 and all smoke files pass against it; `down` + `up` keeps data, `down -v` + `up` reseeds.

## Local Infra
- Users: `docker compose -f apps/users/compose.yaml up -d` → DB `localhost:5434` `readme-users` (admin/test), pgAdmin `http://localhost:8083`. Needs notify's RabbitMQ running to publish `user.registered`.
- Launch instructions for the whole project live in the root `specification.md`.
- Blog: `docker compose -f apps/blog/compose.yaml up -d` → DB `localhost:5433` `readme-blog` (admin/test), pgAdmin `http://localhost:8082`.
- Notify: `docker compose -f apps/notify/compose.yaml up -d` → RabbitMQ AMQP `localhost:5672` + UI `http://localhost:15672` (admin/test), DB `localhost:5435` `readme-notify` (admin/test), pgAdmin `http://localhost:8084`, Mailpit SMTP `localhost:1025` + UI `http://localhost:8025`.
- File-storage: `docker compose -f apps/file-storage/compose.yaml up -d` → DB `localhost:5436` `readme-file-storage` (admin/test), pgAdmin `http://localhost:8085`. App on `http://localhost:3004/api`, static files at `http://localhost:3004/static`.
- API Gateway: **no compose** — stateless. App on `http://localhost:3005/api`, Swagger `http://localhost:3005/spec`. Requires all 4 downstream services running. `.env` must have `JWT_ACCESS_TOKEN_SECRET` byte-identical to `apps/users/.env`.
- Renamed-from-Mongo containers: add `--remove-orphans`. Credential changes ignored → stop compose, remove `apps/<app>/postgres`, restart.

## Git
- **Never commit to `master`.** Branch per task: `moduleN-taskM`. Check with `git branch --show-current`.
