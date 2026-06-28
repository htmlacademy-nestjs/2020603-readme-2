# AGENTS.md

HTML Academy "Readme" course project — NestJS 11 + Nx 22 monorepo (ESM, `"type": "module"`).

## Critical layout
- All real code is in `project/`. Run every `npm`/`nx` command from `project/`, not the repo root. The repo root only holds course docs (`Readme.md`, `Workflow.md`, `Contributing.md`, `specification.md`) and `markup/`.
- `project/package.json` has empty `scripts: {}`. Ignore `Workflow.md`'s `npm run compile|build|lint|start|ts` — those scripts do NOT exist here. Use Nx targets.
- `.github/workflows/check.yml` is a stale template: it only runs if a **root** `package.json` exists (none does), so CI is effectively a no-op (and pins Node 16). Use Node 20+ locally.

## Commands (run from `project/`)
- Install: `npm install`
- Dev server: `npx nx serve users`
- Build (compiles via webpack + SWC): `npx nx build users`
- Lint: `npx nx lint users`  · all: `npx nx run-many -t lint`
- Typecheck: `npx nx typecheck users`
- Test one app: `npx nx test users`  · all: `npx nx run-many -t test`
- Focused test (Jest 30, args forwarded): `npx nx test users -t "<name>"` or `--testPathPatterns=user.service`
- Inspect a project's targets: `npx nx show project users`
- Prisma DB targets (need Postgres up for migrate/reset/fill): `npx nx db-migrate users --name <name>`, `npx nx db-generate users`, `npx nx db-fill users`, `npx nx db-reset users`; same targets exist for `blog`; schema-only check: `npx nx db-validate <app>`
- `nx test` has `dependsOn: ['^build']`, so dependent libs build first (first run is slower).

## Verification status
- `npx nx build <app>` — works (webpack + SWC). The real "does it compile" check.
- `npx nx test <app>` / `run-many -t test` — works (Jest via SWC). The preset is `jest.preset.cjs` (CommonJS file under the ESM root); each app's `jest.config.cts` references it. New scaffold controller specs must mock the controller's service (see `apps/users/.../authentication.controller.spec.ts`).
- `npx nx lint <app>` / `run-many -t lint` — clean (one harmless `@typescript-eslint/no-explicit-any` **warning** remains in `apps/blog/.../post/post.controller.ts` on `update(@Body() dto: any)`).
- `npx nx typecheck <app>` — **still fails**: the inferred target runs `tsc --build --emitDeclarationOnly`, but the workspace maps `@project/*` aliases to lib **source** with no TS project references, so composite builds hit `TS6059`/`TS6305`/`TS6306`. A real fix needs a project-references migration (`nx sync` → per-app `rootDir` + `references`), which is a known TODO. Use `nx build` / `nx test` as your verification meanwhile.
- `users` and `blog` have Prisma DB targets (executor `nx:run-commands`): `db-validate`, `db-generate`, `db-migrate` (pass `--name`: `npx nx db-migrate <app> --name <name>`), `db-reset` (`--force`), `db-fill` (seed). `db-validate`/`db-generate` run without a DB; the rest need Postgres up (see "Local infra"). `prisma generate` writes clients into `apps/<app>/src/generated/prisma` (git-ignored).

## Apps (`project/apps/`)
- `users` — implemented on the **Prisma + PostgreSQL stack**: registration/login/JWT/password change, Prisma-backed user repository, UUID primary keys.
- `blog` — implemented on the **Prisma + PostgreSQL stack**: real controllers/services + Prisma-backed repositories (`<f>.repository.ts` injecting `PrismaService`), feature `*.module.ts` are populated and wired into `app.module.ts` via `imports`. Base CRUD for posts (5 types)/comments/likes works end-to-end. No auth/ownership/validation hardening yet (uses `STUB_USER_ID`). Reference for the **Prisma stack**.
- `file-storage` — scaffold; a `file/` module exists but is NOT imported into `app.module.ts`.
- `notify` — empty Nx scaffold ("Hello API").
- No `*-e2e` apps exist, though `nx.json` still lists them in the Jest `exclude`.

## Shared libs (`project/libs/`) — import via alias, never relative
- `@project/shared-types` — domain classes/enums (`User`, `Post` union, `Comment`, `Like`, `PostType`, `TokenPayload`, `PaginationResult`, ...). Repositories map DB docs to these classes.
- `@project/shared-errors` — `DomainError` base + subclasses and `DomainExceptionFilter` (maps domain errors → HTTP: 404/403/409/401).
- `@project/shared-config` — `validateEnvironment(schema, config)` (class-transformer + class-validator).

## Conventions (shared by both stacks)
- ESM (`"type": "module"`). Prettier: single quotes. EditorConfig: 2-space indent, LF, final newline.
- Per feature: a folder with `<f>.controller.ts`, `<f>.service.ts`, `<f>.module.ts`, `<f>.repository.ts`, `<f>.constant.ts`, `<f>.errors.ts`, plus `dto/` and `rdo/`. Prisma schema files live in `apps/<app>/prisma/schema.prisma`; don't add per-feature schema files for Prisma apps.
- Feature modules: each `<f>.module.ts` declares its controller + service + repository and is imported into `app.module.ts` via `imports: [...]` (see `apps/blog/src/app/app.module.ts`). Don't wire controllers/providers directly in `app.module.ts`.
- DTOs = input (`class-validator` + `@ApiProperty`). RDOs = output (`class-transformer` `@Expose`, serialized via `plainToInstance(Rdo, x, { excludeExtraneousValues: true })`). Controllers wrap responses in RDOs (see `apps/blog/.../post.controller.ts`).
- Errors: services throw domain errors defined in `<feature>.errors.ts` (subclasses of `@project/shared-errors`); `main.ts` registers `app.useGlobalFilters(new DomainExceptionFilter())`. Don't throw raw `@nestjs/common` HTTP exceptions from services. (Both `users` and `blog` follow this.)
- Config: namespaced `registerAs` files in `app/config/` (`app.config.ts` + `postgres.config.ts`) + `env.validation.ts` (a `class-validator` `EnvironmentVariables` class → `validateEnv` delegating to `@project/shared-config`); wired in `app.module.ts` via `ConfigModule.forRoot({ isGlobal, load, validate, envFilePath: 'apps/<app>/.env' })`.
- Bootstrap (`main.ts`): global prefix `api`, `ValidationPipe({ transform: true, whitelist: true })`, Swagger at `/spec`, port from `ConfigService`.
- IDs / service boundaries: a service's own primary keys are UUID; references to entities owned by another service (e.g. `authorId`/`userId` from `users`) are stored as opaque `String` with **no** cross-service FK (API Gateway / §3.10 reconciles them).

### Prisma stack (`users`, `blog`) — **Prisma 7** (ESM, Rust-free, driver-adapter based)
- Prisma 7 changed a lot vs ≤5; do NOT copy old Prisma tutorials. Key facts:
  - `schema.prisma` generator is `prisma-client` (NOT `prisma-client-js`); `output` is **required** and points into the project: `apps/<app>/src/generated/prisma` (git-ignored + eslint-ignored, but compiled because it's under `src/**`). It is NOT generated into `node_modules`.
  - The `datasource` block has **no `url`** (Prisma 7 forbids it). Connection config lives in `apps/<app>/prisma.config.ts` (`defineConfig` from `prisma/config`), which also sets `schema`, `migrations.path`, and `migrations.seed`. Prisma 7 does **not** auto-load `.env` — `prisma.config.ts` loads `apps/<app>/.env` via `dotenv` and builds the URL from `POSTGRES_*`. Run CLI with `--config apps/<app>/prisma.config.ts`.
  - The runtime client **requires a driver adapter**: `PrismaService extends PrismaClient` is constructed with `new PrismaPg({ connectionString })` from `@prisma/adapter-pg` (`super({ adapter })`). See `apps/<app>/src/app/prisma/prisma.service.ts`.
- `PrismaModule` (`apps/<app>/src/app/prisma/prisma.module.ts`) is `@Global` and exports `PrismaService`; feature repositories inject it. (`src/app/prisma/` = the NestJS DI wrapper, a different layer from `apps/<app>/prisma/` = ORM assets.)
- Repositories (`<f>.repository.ts`) call `prisma.*` and **map Prisma records → shared-types classes** (see `apps/blog/src/app/post/post.repository.ts`). Posts use single-table inheritance: one `posts` table with a `type` enum + nullable type-specific columns; the mapper rebuilds the right `VideoPost|TextPost|QuotePost|PhotoPost|LinkPost`.
- Counts are **not** denormalized: `likesCount`/`commentsCount` come from Prisma `_count` (`include: { _count: { select: { likes, comments } } }`); don't hand-maintain counters. Tags m-n via `connectOrCreate`; on update, replace with `set: []` + `connectOrCreate`.
- API smoke tests: `apps/blog/blog.http` (REST Client) covers CRUD for the 3 resources using response variables (`# @name createPost` → `{{createPost.response.body.$.id}}`).

## Don't copy blindly (current gaps)
- Some 0-byte stub files still exist (e.g. `apps/users/src/app/user/dto/update-user.dto.ts`, `apps/blog/src/app/post/dto/update-post.dto.ts`). Blog feature `*.module.ts` are now populated (no longer stubs).

## Gotchas (learned the hard way)
- **Numeric env vars need an explicit `: number` type** in `EnvironmentVariables` (e.g. `public APPLICATION_PORT: number = 3002`). Under SWC the decorator's `design:type` must be `Number` so `validateEnvironment`'s `enableImplicitConversion` turns the `.env` string into a number; otherwise `@IsInt`/`@Min`/`@Max` fail at boot with "isInt". Both `users` and `blog` were fixed this way.
- **Post DTO `type` field must carry a validator** (`@Equals(PostType.X)`). With `ValidationPipe({ whitelist: true })`, any property without a class-validator decorator is stripped, so an undecorated `type` becomes `undefined` and `PostService.buildPostByDto` returns `undefined` → 500 on create. All 5 `create-*-post.dto.ts` use `@Equals`.
- **Port 5432 conflicts**: a local Postgres often listens on `localhost:5432`, shadowing Docker containers. `blog` uses host port **5433** and `users` uses **5434** (`POSTGRES_PORT` in each `.env`, mapped `'${POSTGRES_PORT}:5432'`). Give future Postgres services their own host port.
- **`apps/<app>/tsconfig.app.json`** intentionally adds `prisma.config.ts` + `prisma/**/*.ts` to `include` so `import.meta` (used in those tool scripts) compiles under the ESM `module` setting. Harmless for the webpack bundle (it only bundles the `main.ts` import graph).

## Tests
- Jest 30 via SWC; `*.spec.ts` co-located with a source. Per app: `jest.config.cts` reads `.spec.swcrc` and uses the root `jest.preset.cjs`; root `jest.config.ts` aggregates projects via `getJestProjectsAsync()`.

## Local infra (`users` = Postgres, `blog` = Postgres)
- `.env` files are local dev files and are ignored by git. `envFilePath` is hardcoded per app (`apps/<app>/.env`) — another reason to run from `project/`.
- `users` (Postgres): creds `admin/test`, db `readme-users`, app port 3001, host DB port **5434**, pgAdmin on **8083** (`admin@readme.com` / `test`). Start: `docker compose -f apps/users/compose.yaml up -d` (`postgres:18` + `dpage/pgadmin4`; data persists in `apps/users/postgres/`). Then `npx nx db-migrate users --name init` and `npx nx db-fill users`.
- `blog` (Postgres): creds `admin/test`, db `readme-blog`, app port 3002, host DB port **5433** (avoids local-Postgres conflict on 5432), pgAdmin on 8082. Start: `docker compose -f apps/blog/compose.yaml up -d` (`postgres:18` + `dpage/pgadmin4`; data persists in `apps/blog/postgres/`, mounted at `/var/lib/postgresql`). Then `npx nx db-migrate blog --name init` and `npx nx db-fill blog`.
- Data dirs (`**/mongodb/`, `**/postgres/`) and Prisma generated clients (`apps/*/src/generated/`) are git-ignored. If a Postgres container ignores new `.env` creds, the data dir was pre-initialized — `docker compose ... down` + `rm -rf apps/<app>/postgres` + `up` re-inits it.
- `notify`/`file-storage` have no `.env`/`compose.yaml` yet — add them when implementing.

## Git / course workflow (see Contributing.md)
- Branch per task: `moduleN-taskM`; check the current branch with `git branch --show-current`. Don't commit to `master`.
