from fastapi import APIRouter, Depends, Header, Request

from app.core.deps import CurrentUser, get_current_user, get_session
from app.core.security.captcha import new_captcha
from app.features.auth.schemas import CaptchaOut, LoginRequest, TokenOut, UserOut
from app.features.auth import service as auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/captcha", response_model=CaptchaOut, operation_id="getCaptcha")
def captcha():
    return new_captcha()


@router.post("/login", response_model=TokenOut, operation_id="login")
def login(req: LoginRequest, request: Request, session=Depends(get_session)):
    ip = request.client.host if request.client else ""
    ua = request.headers.get("user-agent", "")
    return auth_service.login(session, req, ip=ip, ua=ua)


@router.post("/logout", operation_id="logout")
def logout(authorization: str = Header(default="")):
    if authorization.startswith("Bearer "):
        auth_service.logout(authorization[7:])
    return {"ok": True}


@router.get("/me", response_model=UserOut, operation_id="me")
def me(session=Depends(get_session), user: CurrentUser = Depends(get_current_user)):
    return auth_service.me_full(session, user)
