# Plumbline 小白使用手册

这份手册面向第一次接触本项目的人。你可以把 Plumbline 理解成一个“企业后台管理系统模板”，里面已经有登录、用户管理、角色管理、菜单管理、字典管理、日志管理等功能。

## 1. 这个系统能做什么

当前系统主要用于管理后台基础能力：

- 登录系统：账号登录、Token、验证码、账户锁定。
- 用户管理：新增、编辑、停用、删除用户，分配角色。
- 角色管理：维护角色，给角色分配菜单和按钮权限。
- 菜单管理：维护后台菜单树和权限码。
- 字典管理：维护下拉选项、状态类型等通用数据。
- 日志管理：查看登录日志和操作日志。
- 安全能力：敏感字段加密存储、脱敏展示、权限控制、操作审计。

## 2. 先认识几个目录

新手只需要先记住这几个目录：

```text
specs/      需求和设计说明
backend/    后端服务，负责接口、数据库、安全、权限
frontend/   前端页面，负责浏览器里看到的管理后台
docs/       项目文档
tools/      检查脚本和自动化脚本
```

最重要的是：

```text
specs/prd/PRD-sys-admin.md
```

这里写了系统管理模块的需求。项目里的代码都要能追溯到这里的需求编号，例如 `[FR-6.1.1]`。

## 3. 推荐启动方式：Docker 一键启动

如果你只是想把系统跑起来看看，推荐用 Docker。

### 3.1 准备环境

你需要先安装：

- Docker Desktop
- Git

如果你还要做前端或后端开发，再安装：

- Node.js 20+
- pnpm 10+
- Python 3.12+
- uv

### 3.2 第一次启动

在项目根目录执行：

```bash
cp .env.example .env
make up
make seed
```

这三条命令分别表示：

```text
cp .env.example .env   复制一份本地配置文件
make up                启动数据库、Redis、后端、前端等服务
make seed              初始化演示账号和演示数据
```

### 3.3 打开系统

启动成功后，浏览器访问：

```text
http://localhost/
```

后端健康检查地址：

```text
http://localhost:8000/health
```

### 3.4 登录账号

可以使用演示账号：

```text
管理员：admin / Admin@123
审计员：auditor / Auditor@123
```

管理员权限更完整，建议新手先用管理员账号登录。

### 3.5 停止系统

不用时执行：

```bash
make down
```

## 4. 本地开发启动方式

如果你想改代码，可以不用 Docker，分别启动后端和前端。

### 4.1 启动后端

打开一个终端：

```bash
cd backend
uv sync --extra dev
uv run python -m app.seed
uv run uvicorn app.main:app --reload
```

后端默认地址：

```text
http://127.0.0.1:8000
```

### 4.2 启动前端

再打开一个终端：

```bash
cd frontend
pnpm install
pnpm dev
```

前端默认地址：

```text
http://127.0.0.1:5173
```

## 5. 登录后怎么使用

### 5.1 用户管理

用户管理用于维护系统账号。

常见操作：

- 查看用户列表
- 搜索用户
- 新建用户
- 编辑用户信息
- 启用或停用用户
- 删除用户
- 给用户分配角色

注意：

- 删除一般是“软删除”，也就是列表不再显示，但数据库中保留记录。
- 手机号、邮箱等敏感信息会加密存储，页面上通常只展示脱敏内容。

### 5.2 角色管理

角色管理用于维护权限集合。

常见操作：

- 查看角色列表
- 新建角色
- 编辑角色
- 删除角色
- 给角色分配菜单和按钮权限

简单理解：

```text
用户拥有角色，角色拥有权限。
```

### 5.3 菜单管理

菜单管理用于维护系统左侧菜单、页面入口和按钮权限。

菜单类型通常包括：

- 目录
- 菜单
- 按钮

按钮权限码示例：

```text
sys:user:read
sys:user:write
sys:role:write
```

这些权限码会被后端接口用来判断用户是否有权限。

### 5.4 字典管理

字典管理用于维护系统中的通用选项。

例如：

- 用户状态
- 业务类型
- 下拉框选项

字典一般分为：

```text
字典类型
字典项
```

例如：

```text
字典类型：user_status
字典项：enabled / disabled
```

### 5.5 日志管理

日志管理用于查看系统行为记录。

包括：

- 登录日志
- 操作日志

用途：

- 排查谁登录过系统
- 排查谁修改过数据
- 审计敏感操作

## 6. 开发时常用命令

这些命令都在项目根目录执行，除非特别说明。

### 6.1 检查规格追溯

```bash
make check
```

它会检查：

- PRD 写得是否规范
- UI 说明引用的需求 ID 是否存在
- 接口是否带有追溯 ID
- 每个功能需求是否有页面或接口覆盖

### 6.2 跑全部测试

```bash
make test-all
```

它会跑：

- 后端测试
- 前端测试

### 6.3 只跑后端测试

```bash
make test
```

或者：

```bash
cd backend
uv run pytest -q
```

跑某一个后端测试文件：

```bash
cd backend
uv run pytest tests/test_sys_user.py -q
```

跑某一个测试函数：

```bash
cd backend
uv run pytest tests/test_sys_user.py::test_name -q
```

### 6.4 只跑前端测试

```bash
cd frontend
pnpm test
```

跑某一个前端测试文件：

```bash
cd frontend
pnpm vitest run src/features/sys_user/SysUserPage.test.tsx
```

### 6.5 前端类型检查

```bash
cd frontend
pnpm lint
```

这里的 `lint` 主要是 TypeScript 类型检查。

### 6.6 后端接口变更后重新生成契约

如果你改了后端接口，先执行：

```bash
make openapi
```

然后执行：

```bash
cd frontend
pnpm orval
```

注意：

```text
frontend/src/lib/api/generated/
```

这里面的文件是自动生成的，不要手动修改。

## 7. 如果要新增一个功能，应该怎么做

这个项目不是直接上来就写代码，而是按“规格驱动”流程做。

推荐顺序：

```text
1. 先确认 PRD 里有没有这个需求
2. 如果没有，在 PRD 里新增一个 [FR-*] 需求编号
3. 写或更新对应的 UI 说明
4. 写后端接口和业务逻辑
5. 导出 OpenAPI 契约
6. 前端根据契约生成类型和接口
7. 写前端页面
8. 补后端和前端测试
9. 执行 make check
10. 执行 make test-all
```

一句话：

```text
需求先行，代码跟随。
```

## 8. 推荐新手阅读顺序

如果你想学习这个项目，建议按这个顺序看：

### 第一步：看 README

```text
README.md
```

了解项目是做什么的、怎么启动。

### 第二步：看 PRD

```text
specs/prd/PRD-sys-admin.md
```

了解系统管理模块的需求。

### 第三步：看字典管理切片

字典管理相对简单，适合入门。

```text
specs/ui/SC-6-sys-dict.md
backend/app/features/sys_dict/
frontend/src/features/sys_dict/
backend/tests/test_sys_dict.py
frontend/src/features/sys_dict/SysDictPage.test.tsx
```

### 第四步：看用户管理切片

用户管理比较完整，涉及权限、加密、脱敏、软删除。

```text
specs/ui/SC-2-sys-user.md
backend/app/features/sys_user/
frontend/src/features/sys_user/
backend/tests/test_sys_user.py
frontend/src/features/sys_user/SysUserPage.test.tsx
```

## 9. 常见问题

### 9.1 `make up` 很慢怎么办

第一次启动会拉 Docker 镜像、安装依赖，比较慢是正常的。后续再启动会快很多。

### 9.2 访问 `http://localhost/` 打不开

可以按顺序检查：

```bash
make up
```

然后看 Docker Desktop 里服务是否都启动成功。

也可以检查后端：

```text
http://localhost:8000/health
```

### 9.3 登录失败怎么办

先确认执行过：

```bash
make seed
```

然后使用：

```text
admin / Admin@123
```

### 9.4 改了接口后前端类型报错怎么办

通常需要重新生成接口契约和前端接口代码：

```bash
make openapi
cd frontend
pnpm orval
```

### 9.5 前端测试失败怎么办

先单独跑前端测试：

```bash
cd frontend
pnpm test
```

如果是类型问题，再跑：

```bash
cd frontend
pnpm lint
```

### 9.6 后端测试失败怎么办

执行：

```bash
cd backend
uv run pytest -q
```

如果依赖缺失，先执行：

```bash
cd backend
uv sync --extra dev
```

## 10. 最重要的项目规则

### 10.1 不要跳过 PRD

新增功能前，先确认需求是否存在。

需求位置：

```text
specs/prd/PRD-sys-admin.md
```

### 10.2 不要手改生成文件

不要手动修改：

```text
frontend/src/lib/api/generated/
specs/contract/openapi.json
```

接口变化时用命令重新生成。

### 10.3 改完要跑检查

至少执行：

```bash
make check
make test-all
```

### 10.4 一个功能看一个切片

例如用户管理：

```text
backend/app/features/sys_user/
frontend/src/features/sys_user/
specs/ui/SC-2-sys-user.md
```

不要一上来就在全项目里乱找。

## 11. 一句话总结

Plumbline 是一个按“需求 → 设计 → 后端 → 前端 → 测试 → 检查”流程构建的企业后台管理系统模板。新手先用 `make up` 跑起来，再从字典管理或用户管理切片开始学习，会比较容易理解整个项目。
