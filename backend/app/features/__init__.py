"""导入各切片与跨切片审计的表模型，确保 SQLModel.metadata 注册齐全。"""
from app.core.audit import models as _audit  # noqa: F401
from app.features.auth import models as _auth  # noqa: F401
from app.features.review import models as _review  # noqa: F401
