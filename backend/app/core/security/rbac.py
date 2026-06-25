"""RBAC：角色 → 按钮级权限映射 + 数据范围过滤。"""
from __future__ import annotations

# 角色 → 权限码（按钮级）。权限码 = "资源:动作"。
ROLE_PERMISSIONS: dict[str, set[str]] = {
    "管理员": {"*"},
    "评审专家": {"ranking:read", "review:qc", "review:fast_track", "review:highlight"},
    "回测分析员": {"ranking:read", "backtest:run"},
    "标准配置员": {"indicator:read", "indicator:write", "ranking:read"},
}


def has_perm(roles: list[str], perm: str) -> bool:
    for r in roles:
        granted = ROLE_PERMISSIONS.get(r, set())
        if "*" in granted or perm in granted:
            return True
    return False


def data_scope(roles: list[str], user_id: str) -> dict:
    """返回数据范围过滤条件（示意）。管理员看全部；其余仅本人相关。"""
    if "管理员" in roles:
        return {}  # 无过滤
    return {"owner_or_assignee": user_id}
