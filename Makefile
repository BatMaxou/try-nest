# --- ACCESS ENV VARS (used for exec-db) ---
-include .env
-include .env.local

# --- CONTAINER ---
node = docker compose exec node
run-node = docker compose run --rm node

# --- HANDLE PARAMS ---
%:
	@:

ARGS = `arg="$(filter-out $@,$(MAKECMDGOALS))" && echo $${arg:-${1}}`

# --- DEV COMMANDS ---
up:
	@docker compose up -d $(ARGS)
.PHONY: up

down:
	@docker compose down $(ARGS)
.PHONY: down

vendor:
	${run-node} pnpm install --frozen-lockfile --ignore-scripts=false
.PHONY: front-vendor

# --- LINTERS ---
type-check:
	@${node} pnpm run type:check
.PHONY: type-check

eslint:
	@${node} pnpm run lint
.PHONY: eslint

prettier:
	@${node} pnpm run format
.PHONY: prettier

prettier-fix:
	@${node} pnpm run format:fix
.PHONY: prettier-fix

lint:
	@${MAKE} type-check
	@${MAKE} eslint
	@${MAKE} prettier
.PHONY: front-lint

build:
	@${node} pnpm run build
.PHONY: front-build

# --- TESTS ---
tests:
	@${node} pnpm test:e2e
.PHONY: test

# --- DEV UTILS ---
exec-db:
	@docker compose exec ${DATABASE_HOST} psql -h ${DATABASE_HOST} -U ${DATABASE_USERNAME} -d ${DATABASE_NAME}
.PHONY: exec-db

