"""生成一对 SM2 PEM 密钥（生产 JWT 签名/传输信封用）。

用法（先装国密扩展）：

    cd backend && uv sync --extra crypto
    uv run python ../tools/keygen_sm2.py            # 输出到当前目录的 sm2-private.pem / sm2-public.pem
    uv run python ../tools/keygen_sm2.py --env      # 直接打印成 .env 行：SM2_PRIVATE_KEY=...

不要把生成出来的 sm2-private.pem 提交到仓库，更不要硬编码进 .env.example。
"""

from __future__ import annotations

import argparse
import pathlib
import sys


def _load_tongsuopy():
    try:
        from tongsuopy.crypto import serialization  # type: ignore
        from tongsuopy.crypto.asymmetric import sm2  # type: ignore
    except Exception as e:
        sys.stderr.write(
            "未检测到 tongsuopy。先在 backend 下执行：uv sync --extra crypto\n"
            f"原始错误：{e}\n"
        )
        raise SystemExit(2)
    return sm2, serialization


def generate_pem_pair() -> tuple[bytes, bytes]:
    sm2, serialization = _load_tongsuopy()
    priv = sm2.generate_private_key()
    priv_pem = priv.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pub_pem = priv.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return priv_pem, pub_pem


def main() -> None:
    parser = argparse.ArgumentParser(description="生成 SM2 PEM 密钥对")
    parser.add_argument("--out-dir", default=".", help="输出目录（默认当前目录）")
    parser.add_argument(
        "--env", action="store_true", help="直接打印为 .env 行（多行 PEM 用 \\n 连接）"
    )
    args = parser.parse_args()

    priv_pem, pub_pem = generate_pem_pair()

    if args.env:
        # .env 不支持原生多行，把换行转义成 \n，配合 python-dotenv / pydantic 解析
        priv_one = priv_pem.decode().replace("\n", "\\n")
        pub_one = pub_pem.decode().replace("\n", "\\n")
        print(f'SM2_PRIVATE_KEY="{priv_one}"')
        print(f'SM2_PUBLIC_KEY="{pub_one}"')
        return

    out = pathlib.Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    priv_file = out / "sm2-private.pem"
    pub_file = out / "sm2-public.pem"
    priv_file.write_bytes(priv_pem)
    pub_file.write_bytes(pub_pem)
    priv_file.chmod(0o600)
    print(f"已生成：{priv_file}（权限 600）\n      {pub_file}")
    print(
        "把内容粘进 .env 的 SM2_PRIVATE_KEY / SM2_PUBLIC_KEY，或改用 --env 直接打印为 .env 行。"
    )


if __name__ == "__main__":
    main()
