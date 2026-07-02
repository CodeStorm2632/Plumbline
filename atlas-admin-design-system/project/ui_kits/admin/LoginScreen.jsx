/* Atlas Admin UI kit — LoginScreen. Account login + captcha + lock alert. */
const { Button, Input, FormField, Checkbox, Alert } = window.AtlasAdminDesignSystem_9d1c70;

function Captcha({ code = 'A7K9' }) {
  return (
    <div style={{ width: '96px', height: 'var(--control-h-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--input)', background: 'linear-gradient(135deg, var(--muted), var(--card))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative', cursor: 'pointer', userSelect: 'none' }} title="点击刷新">
      <svg width="96" height="34" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <path d="M4 20 Q30 4 60 22 T96 14" stroke="var(--muted-foreground)" fill="none" strokeWidth="1"/>
        <path d="M0 10 Q40 30 96 8" stroke="var(--border-strong)" fill="none" strokeWidth="1"/>
      </svg>
      {code.split('').map((c, i) => (
        <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '17px', fontWeight: 700, color: ['var(--primary)','var(--foreground)','var(--info)','var(--foreground)'][i % 4], transform: `rotate(${[-8,6,-4,10][i%4]}deg)`, margin: '0 1px', position: 'relative' }}>{c}</span>
      ))}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [locked, setLocked] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [u, setU] = React.useState('zhangwei');
  const [p, setP] = React.useState('••••••••');
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 1fr', fontFamily: 'var(--font-sans)' }}>
      {/* Brand panel */}
      <div style={{ position: 'relative', background: 'linear-gradient(160deg, oklch(0.32 0.11 264), oklch(0.2 0.06 264))', color: '#fff', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.14, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '28px 28px', color: '#fff' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', position: 'relative' }}>
          <img src="../../assets/logo-mark.svg" width="34" height="34" alt="" />
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>Atlas Admin</span>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em' }}>企业级中后台<br/>管理系统脚手架</div>
          <div style={{ marginTop: '14px', fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.72)', maxWidth: '340px', lineHeight: 1.6 }}>统一的权限模型、数据表格与审计追踪，快速搭建各类业务系统的管理端。</div>
          <div style={{ marginTop: '28px', display: 'flex', gap: '20px' }}>
            {[['RBAC','细粒度权限'],['AES','敏感字段加密'],['Audit','操作审计']].map(([a,b]) => (
              <div key={a}><div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700 }}>{a}</div><div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)' }}>{b}</div></div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)' }}>© 2026 Atlas Admin · v1.0 Scaffold</div>
      </div>
      {/* Form */}
      <div style={{ background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>登录</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px', marginBottom: '22px' }}>请输入账户信息以进入管理后台</div>
          {locked ? <div style={{ marginBottom: '16px' }}><Alert tone="warning" title="账户已锁定" onClose={() => setLocked(false)}>连续 5 次密码错误，账户已锁定，请 15 分钟后重试或联系管理员。</Alert></div> : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormField label="账号" required><Input value={u} onChange={(e)=>setU(e.target.value)} placeholder="请输入登录账号" /></FormField>
            <FormField label="密码" required><Input type="password" value={p} onChange={(e)=>setP(e.target.value)} placeholder="请输入密码" /></FormField>
            <FormField label="验证码" required>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input placeholder="请输入验证码" style={{ flex: 1 }} />
                <Captcha />
              </div>
            </FormField>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Checkbox checked={remember} onChange={setRemember} label="记住登录" />
              <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)', textDecoration: 'none' }}>忘记密码？</a>
            </div>
            <Button size="lg" style={{ width: '100%', marginTop: '4px' }} onClick={onLogin}>登 录</Button>
            <button onClick={()=>setLocked(v=>!v)} style={{ background:'none',border:'none',color:'var(--muted-foreground)',fontSize:'var(--text-xs)',cursor:'pointer',fontFamily:'inherit' }}>（演示：切换账户锁定提示）</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.LoginScreen = LoginScreen;
