# Запуск і обслуговування проєкту локально.
#
# Налаштування бази лежить у .env.local (його не в репозиторії):
#   DATABASE_URL=postgres://eg:eg@localhost:5433/english_grammar
#   AUTH_SECRET=<npx auth secret>
# Без нього застосунок теж працює — просто без кешу словника і без входу.

PG_CONTAINER := eg-postgres
PG_IMAGE     := postgres:17-alpine
PG_PORT      := 5433
PG_USER      := eg
PG_PASSWORD  := eg
PG_DB        := english_grammar

.DEFAULT_GOAL := help
.PHONY: help install dev build start check typecheck lint test \
        db db-stop db-logs db-shell db-push db-seed db-studio db-reset clean

help: ## Показати цю довідку
	@echo 'Граматика англійської — команди:'
	@echo
	@grep -hE '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "} {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo

install: ## Встановити залежності
	npm install

# --- Розробка -----------------------------------------------------------------

dev: db ## Підняти базу і запустити сервер розробки на 3000
	npm run dev

build: ## Виробнича збірка
	npm run build

start: db ## Запустити виробничу збірку (спершу `make build`)
	npm start

# --- Перевірки ----------------------------------------------------------------

check: typecheck lint test ## Усі перевірки поспіль

typecheck: ## Перевірка типів
	npm run typecheck

lint: ## ESLint
	npm run lint

test: ## Тести (vitest, один прогін)
	npm test

# --- База ---------------------------------------------------------------------

db: ## Підняти Postgres у Docker і дочекатись готовності
	@if [ -z "$$(docker ps -q -f name=^/$(PG_CONTAINER)$$)" ]; then \
	  if [ -n "$$(docker ps -aq -f name=^/$(PG_CONTAINER)$$)" ]; then \
	    echo '→ запускаю наявний контейнер $(PG_CONTAINER)'; \
	    docker start $(PG_CONTAINER) >/dev/null; \
	  else \
	    echo '→ створюю контейнер $(PG_CONTAINER) на порті $(PG_PORT)'; \
	    docker run -d --name $(PG_CONTAINER) -p $(PG_PORT):5432 \
	      -e POSTGRES_USER=$(PG_USER) \
	      -e POSTGRES_PASSWORD=$(PG_PASSWORD) \
	      -e POSTGRES_DB=$(PG_DB) \
	      $(PG_IMAGE) >/dev/null; \
	  fi; \
	fi
	@printf '→ чекаю на базу'
	@for i in $$(seq 1 30); do \
	  if docker exec $(PG_CONTAINER) pg_isready -U $(PG_USER) -d $(PG_DB) >/dev/null 2>&1; then \
	    echo ' — готова'; exit 0; \
	  fi; \
	  printf '.'; sleep 1; \
	done; \
	echo; echo 'база не піднялась — дивіться `make db-logs`'; exit 1

db-stop: ## Зупинити базу (дані лишаються)
	docker stop $(PG_CONTAINER)

db-logs: ## Останні рядки логу бази
	docker logs --tail 50 $(PG_CONTAINER)

db-shell: db ## Відкрити psql
	docker exec -it $(PG_CONTAINER) psql -U $(PG_USER) -d $(PG_DB)

db-push: db ## Накотити схему з src/db/schema.ts
	npm run db:push -- --force

db-seed: db ## Засіяти бібліотеку й тарифи з артефактів репозиторію
	npm run db:seed

db-studio: db ## Drizzle Studio у браузері
	npm run db:studio

db-reset: ## Знести базу разом з даними і накотити схему заново (потрібно FORCE=1)
	@if [ "$(FORCE)" != "1" ]; then \
	  echo 'Це видалить контейнер $(PG_CONTAINER) і всі локальні дані.'; \
	  echo 'Якщо саме цього й хочете: make db-reset FORCE=1'; \
	  exit 1; \
	fi
	-docker rm -f $(PG_CONTAINER)
	@$(MAKE) --no-print-directory db-push
	@$(MAKE) --no-print-directory db-seed

# --- Прибирання ---------------------------------------------------------------

clean: ## Прибрати збірку і кеші
	rm -rf .next node_modules/.cache
