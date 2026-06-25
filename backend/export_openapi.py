"""导出 OpenAPI 契约：`uv run python export_openapi.py ../openapi/openapi.json`"""
import json
import sys

from app.main import app

out = sys.argv[1] if len(sys.argv) > 1 else "../specs/contract/openapi.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(app.openapi(), f, ensure_ascii=False, indent=2)
print("exported:", out)
