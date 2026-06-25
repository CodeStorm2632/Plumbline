"""口令策略：长度 + 大写 + 小写 + 数字 + 特殊字符。"""
import re

MIN_LEN = 8
SPECIAL = r"""!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?"""


def check_password(pw: str) -> list[str]:
    """返回不满足项的中文说明列表；空列表 = 通过。"""
    errs = []
    if len(pw) < MIN_LEN:
        errs.append(f"长度至少 {MIN_LEN} 位")
    if not re.search(r"[A-Z]", pw):
        errs.append("需包含大写字母")
    if not re.search(r"[a-z]", pw):
        errs.append("需包含小写字母")
    if not re.search(r"[0-9]", pw):
        errs.append("需包含数字")
    if not re.search(f"[{SPECIAL}]", pw):
        errs.append("需包含特殊字符")
    return errs
