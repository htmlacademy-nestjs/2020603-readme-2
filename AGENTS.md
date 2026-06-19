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
- `nx test` has `dependsOn: ['^build']`, so dependent libs build first (first run is slower).

## Verification status
- `npx nx build <app>` — works (webpack + SWC). The real "does it compile" check.
- `npx nx test <app>` / `run-many -t test` — works (Jest via SWC). The preset is `jest.preset.cjs` (CommonJS file under the ESM root); each app's `jest.config.cts` references it. New scaffold controller specs must mock the controller's service (see `apps/users/.../authentication.controller.spec.ts`).
- `npx nx lint <app>` / `run-many -t lint` — clean (one harmless `@typescript-eslint/no-explicit-any` **warning** remains in `apps/blog/.../post/post.controller.ts`).
- `npx nx typecheck <app>` — **still fails**: the inferred target runs `tsc --build --emitDeclarationOnly`, but the workspace maps `@project/*` aliases to lib **source** with no TS project references, so composite builds hit `TS6059`/`TS6305`/`TS6306`. A real fix needs a project-references migration (`nx sync` → per-app `rootDir` + `references`), which is a known TODO. Use `nx build` / `nx test` as your verification meanwhile.

## Apps (`project/apps/`)
- `users` — the ONLY fully implemented app (Mongoose + MongoDB). Use it as the reference/template for new services.
- `blog` — partial: real controllers/services but in-memory `Map` repos (`*-memory.repository.ts`); feature `*.module.ts` are empty 0-byte stubs (wired directly in `app.module.ts`).
- `file-storage` — scaffold; a `file/` module exists but is NOT imported into `app.module.ts`.
- `notify` — empty Nx scaffold ("Hello API").
- No `*-e2e` apps exist, though `nx.json` still lists them in the Jest `exclude`.

## Shared libs (`project/libs/`) — import via alias, never relative
- `@project/shared-types` — domain classes/enums (`User`, `Post` union, `Comment`, `Like`, `PostType`, `TokenPayload`, `PaginationResult`, ...). Repositories map DB docs to these classes.
- `@project/shared-errors` — `DomainError` base + subclasses and `DomainExceptionFilter` (maps domain errors → HTTP: 404/403/409/401).
- `@project/shared-config` — `validateEnvironment(schema, config)` (class-transformer + class-validator).

## Conventions (model on `users`)
- ESM (`"type": "module"`). Prettier: single quotes. EditorConfig: 2-space indent, LF, final newline.
- Per feature: a folder with `<f>.controller.ts`, `<f>.service.ts`, `<f>.module.ts`, `<f>.repository.ts`, `<f>.schema.ts`, `<f>.constant.ts`, `<f>.errors.ts`, plus `dto/` and `rdo/`.
- DTOs = input (`class-validator` + `@ApiProperty`). RDOs = output (`class-transformer` `@Expose`, serialized via `plainToInstance(Rdo, x, { excludeExtraneousValues: true })`).
- Errors: services throw domain errors defined in `<feature>.errors.ts` (subclasses of `@project/shared-errors`); `main.ts` registers `app.useGlobalFilters(new DomainExceptionFilter())`. Don't throw raw `@nestjs/common` HTTP exceptions from services. (Both `users` and `blog` follow this.)
- Config: namespaced `registerAs` files in `app/config/` (`app.config.ts`, `mongo.config.ts`) + `env.validation.ts` (a `class-validator` `EnvironmentVariables` class → `validateEnv` delegating to `@project/shared-config`); wired in `app.module.ts` via `ConfigModule.forRoot({ load, validate, envFilePath: 'apps/<app>/.env' })`.
- Mongoose: `XModel` class, `export const XSchema = SchemaFactory.createForClass(...)`, `XDocument = HydratedDocument<XModel>`; repos inject `@InjectModel` and map docs → shared-types classes (see `apps/users/src/app/user/user.repository.ts`).
- Bootstrap (`main.ts`): global prefix `api`, `ValidationPipe({ transform: true, whitelist: true })`, Swagger at `/spec`, port from `ConfigService`.

## Don't copy blindly (current gaps)
- `users` `login()` returns a hardcoded `'jwt-token-placeholder'` — JWT is not implemented yet.
- Several 0-byte stub files exist (e.g. `apps/users/src/app/user/dto/update-user.dto.ts`, blog `*.module.ts`).

## Tests
- Jest 30 via SWC; `*.spec.ts` co-located with a source. Per app: `jest.config.cts` reads `.spec.swcrc` and uses the root `jest.preset.cjs`; root `jest.config.ts` aggregates projects via `getJestProjectsAsync()`.

## Local infra (only `users` has it)
- `apps/users/.env` is committed (dev creds: mongo `admin/test`, db `readme-users`, app port 3001, mongo-express 8081). `envFilePath` is hardcoded to `apps/users/.env` — another reason to run from `project/`.
- Start the DB from `project/`: `docker compose -f apps/users/compose.yaml up -d` (`mongo:8` on 27017 + `mongo-express:1` on 8081; data persists in `apps/users/mongodb/`).
- Other apps have no `.env`/`compose.yaml`/`mongodb/` yet — add them when implementing.

## Git / course workflow (see Contributing.md)
- Branch per task: `moduleN-taskM`; check the current branch with `git branch --show-current`. Don't commit to `master`.
