.PHONY: help check test gen-lock check-lock openapi seed up down fmt keygen-sm2
help:
	@echo "check       本地跑四道规格关卡 (pipeline_check.sh)"
	@echo "check-lock  比对 requirements-lock.yaml（ID 稳定性）"
	@echo "gen-lock    生成/更新 requirements-lock.yaml"
	@echo "test        后端 pytest"
	@echo "openapi     从后端导出 openapi/openapi.json"
	@echo "seed        灌入演示数据"
	@echo "up/down     docker compose 起停"
	@echo "keygen-sm2  生成一对 SM2 PEM（默认写到 secrets/，私钥 chmod 600）；OUT=路径覆盖目录，ENV=1 改打印为 .env 行"

check:
	bash tools/pipeline/pipeline_check.sh .

check-strict:
	bash tools/pipeline/pipeline_check.sh . --strict

gen-lock:
	python tools/pipeline/requirements_lock.py gen specs/prd/PRD-*.md --lock specs/requirements-lock.yaml

check-lock:
	python tools/pipeline/requirements_lock.py check specs/prd/PRD-*.md --lock specs/requirements-lock.yaml

test:
	cd backend && uv run pytest -q

openapi:
	cd backend && uv run python export_openapi.py ../specs/contract/openapi.json

seed:
	cd backend && uv run python -m app.seed

up:
	docker compose up --build -d
down:
	docker compose down

# —— 测试 / 构建 / 部署 ——
.PHONY: test-frontend test-all build deploy
test-frontend:
	cd frontend && pnpm install && pnpm test

test-all: test test-frontend

build:
	docker compose -f docker-compose.prod.yml build

deploy:           ## 本地手动部署到当前主机（需 .env 与镜像就绪）：make deploy TAG=vX
	bash deploy/deploy.sh $(TAG)

# —— 自治循环（loop engineering）——
.PHONY: verify auto
verify:           ## 跑形式化裁判（规格四关+ID锁+测试），done 则 exit 0
	bash tools/loop/verify.sh

auto:             ## 给需求自动执行到裁判全绿：make auto REQ="把榜单做成可导出CSV"
	bash tools/loop/auto_build.sh "$(REQ)"

# —— 安全：生成 SM2 密钥对 ——
# 默认写入 secrets/ 目录（私钥 chmod 600）；OUT=path 覆盖目录；ENV=1 改为打印 .env 行
keygen-sm2:       ## 生成 SM2 密钥对：make keygen-sm2 [OUT=secrets] [ENV=1]
	@if [ "$(ENV)" = "1" ]; then \
		cd backend && uv run python ../tools/keygen_sm2.py --env; \
	else \
		cd backend && uv run python ../tools/keygen_sm2.py --out-dir ../$(or $(OUT),secrets); \
	fi
