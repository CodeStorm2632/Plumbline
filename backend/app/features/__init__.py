"""导入各切片与跨切片审计/RBAC 的表模型，确保 SQLModel.metadata 注册齐全。"""

from app.core.audit import models as _audit  # noqa: F401
from app.core.rbac import models as _rbac  # noqa: F401
from app.features.auth import models as _auth  # noqa: F401
from app.features.sys_dict import models as _sys_dict  # noqa: F401
