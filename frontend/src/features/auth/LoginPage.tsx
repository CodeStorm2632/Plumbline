import { useState } from "react";
import { RotateCcw, ShieldCheck, Database, ClipboardList } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useCaptcha, useLogin } from "./api";

// 登录页（参考 Atlas Admin LoginScreen 双栏布局）
export function LoginPage({ onLoggedIn }: { onLoggedIn?: () => void }) {
  const captcha = useCaptcha();
  const login = useLogin();
  const [form, setForm] = useState({ username: "", password: "", captcha_code: "" });

  const submit = () => {
    if (!captcha.data) return;
    login.mutate(
      { ...form, captcha_id: captcha.data.captcha_id },
      { onSuccess: () => onLoggedIn?.(), onError: () => captcha.refetch() },
    );
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  const features: [typeof ShieldCheck, string, string][] = [
    [ShieldCheck, "RBAC", "细粒度权限"],
    [Database, "SM4", "敏感字段加密"],
    [ClipboardList, "Audit", "操作审计"],
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── 左侧品牌面板 ── */}
      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(160deg, oklch(0.32 0.11 264), oklch(0.2 0.06 264))",
          color: "#fff",
          padding: "48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.14,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo + product name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "15px",
              flexShrink: 0,
            }}
          >
            P
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Plumbline
          </span>
        </div>

        {/* Tagline + features */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
            }}
          >
            企业级中后台
            <br />
            管理系统脚手架
          </div>
          <div
            style={{
              marginTop: "14px",
              fontSize: "var(--text-base)",
              color: "rgba(255,255,255,0.72)",
              maxWidth: "340px",
              lineHeight: 1.6,
            }}
          >
            统一的权限模型、数据表格与审计追踪，
            快速搭建各类业务系统的管理端。
          </div>
          <div style={{ marginTop: "28px", display: "flex", gap: "28px" }}>
            {features.map(([Icon, label, sub]) => (
              <div key={label}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  <Icon size={14} style={{ opacity: 0.85 }} />
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "rgba(255,255,255,0.6)",
                    marginTop: "2px",
                  }}
                >
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "relative",
            fontSize: "var(--text-xs)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          © 2026 Plumbline · SDD Scaffold
        </div>
      </div>

      {/* ── 右侧表单面板 ── */}
      <div
        style={{
          background: "var(--background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "340px" }}>
          {/* Heading */}
          <div
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "var(--font-bold)",
              color: "var(--foreground)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            登录
          </div>
          <div
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
              marginTop: "4px",
              marginBottom: "24px",
            }}
          >
            请输入账户信息以进入管理后台
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* 账号 */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-medium)",
                  color: "var(--foreground)",
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: "var(--destructive)", marginRight: "2px" }}>*</span>
                账号
              </label>
              <Input
                placeholder="请输入登录账号"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onKeyDown={handleKey}
                autoComplete="username"
              />
            </div>

            {/* 密码 */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-medium)",
                  color: "var(--foreground)",
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: "var(--destructive)", marginRight: "2px" }}>*</span>
                密码
              </label>
              <Input
                type="password"
                placeholder="请输入密码"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey}
                autoComplete="current-password"
              />
            </div>

            {/* 验证码 */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-medium)",
                  color: "var(--foreground)",
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: "var(--destructive)", marginRight: "2px" }}>*</span>
                验证码
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Input
                  placeholder="请输入验证码"
                  value={form.captcha_code}
                  onChange={(e) => setForm({ ...form, captcha_code: e.target.value })}
                  onKeyDown={handleKey}
                  style={{ flex: 1 }}
                />
                {captcha.data ? (
                  <img
                    src={captcha.data.image}
                    alt="验证码"
                    onClick={() => captcha.refetch()}
                    title="点击刷新验证码"
                    style={{
                      height: "var(--control-h-md)",
                      width: "96px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-strong)",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => captcha.refetch()}
                    style={{
                      height: "var(--control-h-md)",
                      width: "96px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-strong)",
                      background: "var(--muted)",
                      cursor: "pointer",
                      flexShrink: 0,
                      color: "var(--muted-foreground)",
                    }}
                    title="加载验证码"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {login.isError && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  fontSize: "var(--text-sm)",
                  color: "var(--destructive)",
                  background: "var(--destructive-subtle)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {String((login.error as Error).message)}
              </p>
            )}

            {/* Submit */}
            <Button
              size="lg"
              style={{ width: "100%", marginTop: "4px" }}
              disabled={login.isPending || !form.username || !form.password || !form.captcha_code}
              onClick={submit}
            >
              {login.isPending ? "登录中…" : "登 录"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

