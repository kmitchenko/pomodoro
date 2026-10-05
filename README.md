# Pomodoro

A Pomodoro timer built with React and Node.js, as a pnpm monorepo.

| Package           | Stack                                                    |
| ----------------- | -------------------------------------------------------- |
| `apps/web`        | React 19, Vite, Tailwind CSS v4, Vitest, Testing Library |
| `apps/api`        | Fastify 5, Zod, Drizzle ORM, PostgreSQL                  |
| `packages/shared` | Zod schemas and types shared by web and api              |

## Prerequisites

- Node 24 (pinned in `.node-version`, picked up automatically by [fnm](https://github.com/Schniz/fnm))
- pnpm via Corepack: `corepack enable pnpm`
- Docker (for PostgreSQL)

## Getting started

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
docker compose up -d                     # PostgreSQL on localhost:5433
pnpm --filter @pomodoro/api db:migrate   # apply migrations
pnpm dev                                 # web → http://localhost:5173, api → http://localhost:3000
```

The web dev server proxies `/api/*` to the API, so the browser only talks to one origin.

## Scripts

| Command       | What it does                                      |
| ------------- | ------------------------------------------------- |
| `pnpm dev`    | Run web and api in watch mode                     |
| `pnpm check`  | Format check, lint, typecheck and test everything |
| `pnpm test`   | Run all tests (api tests need Postgres running)   |
| `pnpm build`  | Production builds                                 |
| `pnpm format` | Format all files with Prettier                    |

Database (run with `pnpm --filter @pomodoro/api <script>`):

| Script                        | What it does                               |
| ----------------------------- | ------------------------------------------ |
| `db:generate --name <change>` | Create a migration from `src/db/schema.ts` |
| `db:migrate`                  | Apply pending migrations                   |
| `db:studio`                   | Browse the database in the browser         |

## Conventions

- [Conventional Commits](https://www.conventionalcommits.org/): `feat(web): ...`, `fix(api): ...`, `chore: ...`
- Frontend code is organized by feature: `src/features/<feature>/{components,hooks}`
- Never edit a committed migration; generate a new one instead
