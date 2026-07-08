from fastapi import APIRouter

from app.api.routes import auth, dashboard, system_logs, system_menus, system_roles, system_users

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(system_users.router)
api_router.include_router(system_roles.router)
api_router.include_router(system_menus.router)
api_router.include_router(system_logs.router)
