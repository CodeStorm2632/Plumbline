"""KV 抽象（Token 白名单 / 验证码 / 锁定计数）。

REDIS_URL 可用且 redis 库存在 → 走 Redis；否则内存兜底（带 TTL），保证测试/本地可跑。
"""
from __future__ import annotations

import threading
import time

from app.core.config import settings


class _MemoryStore:
    def __init__(self) -> None:
        self._d: dict[str, tuple[str, float | None]] = {}
        self._lock = threading.Lock()

    def _expired(self, k: str) -> bool:
        v = self._d.get(k)
        return bool(v and v[1] is not None and v[1] < time.time())

    def set(self, k: str, val: str, ttl: int | None = None) -> None:
        with self._lock:
            self._d[k] = (val, time.time() + ttl if ttl else None)

    def get(self, k: str) -> str | None:
        with self._lock:
            if self._expired(k):
                self._d.pop(k, None)
                return None
            v = self._d.get(k)
            return v[0] if v else None

    def delete(self, k: str) -> None:
        with self._lock:
            self._d.pop(k, None)

    def incr(self, k: str, ttl: int | None = None) -> int:
        with self._lock:
            cur = 0 if self._expired(k) else int((self._d.get(k) or ("0", None))[0])
            cur += 1
            self._d[k] = (str(cur), time.time() + ttl if ttl else (self._d.get(k) or (None, None))[1])
            return cur


def _make_store():
    if settings.REDIS_URL:
        try:
            import redis  # type: ignore

            class _RedisStore:
                def __init__(self, url: str):
                    self.r = redis.from_url(url, decode_responses=True)

                def set(self, k, val, ttl=None):
                    self.r.set(k, val, ex=ttl)

                def get(self, k):
                    return self.r.get(k)

                def delete(self, k):
                    self.r.delete(k)

                def incr(self, k, ttl=None):
                    n = self.r.incr(k)
                    if n == 1 and ttl:
                        self.r.expire(k, ttl)
                    return n

            return _RedisStore(settings.REDIS_URL)
        except Exception:
            pass
    return _MemoryStore()


store = _make_store()

# key 约定
def k_token(jti: str) -> str: return f"token:white:{jti}"
def k_captcha(cid: str) -> str: return f"captcha:{cid}"
def k_lock(username: str) -> str: return f"lock:fail:{username}"
