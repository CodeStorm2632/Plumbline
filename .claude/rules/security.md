# 安全约定（企业级，违反即返工）

- **国密统一走 `core/security/crypto.py`**：口令 `hash_password/verify_password`（PBKDF2-SM3），
  字段 `encrypt_field/decrypt_field`（SM4），JWT `sign_jwt/verify_jwt`（SM2）。不要自己另写加密。
- **绝不硬编码密钥/口令**：SM2/SM4 密钥从环境变量/KMS 注入；示例值只进 `.env.example`。
- **敏感字段加密落库**：手机号/邮箱等以 `encrypt_field` 存密文；**展示时脱敏**（`masking.py`）。
- **绝不记录敏感信息**：日志/审计/报错里不得出现明文口令、密钥、完整手机号/证件号。
- **写操作必留痕**：经 `core/audit` 写审计（只增不改），关键路由 x-trace 带 `NFR-4`。
- **鉴权到位**：受保护路由用 `require_perms`/`require_roles`；按钮级权限 + 数据范围过滤（`rbac.py`）。
- **登录链路**：验证码（Redis，5 分钟）→ 锁定检查（5 次/30 分钟）→ 验密 → 发 JWT → 写 Redis 白名单；
  登出即从白名单删除（即时吊销）。改这条链路务必保持各环节齐全。
- 国密生产必须 `uv sync --extra crypto`（装 tongsuopy），否则 crypto 退化为 demo 后端（不安全）。
