/* Atlas Admin UI kit — mock data. Exports to window. */

const USERS = [
  { id: 1, username: 'zhangwei', name: '张伟', dept: '技术部', role: '系统管理员', roleTone: 'primary', phone: '138****6621', status: true, last: '2026-06-30 09:12', mail: 'z***@atlas.io' },
  { id: 2, username: 'lina', name: '李娜', dept: '风控部', role: '审计员', roleTone: 'info', phone: '139****0088', status: true, last: '2026-06-30 08:47', mail: 'l***@atlas.io' },
  { id: 3, username: 'wangqiang', name: '王强', dept: '运营部', role: '运营', roleTone: 'success', phone: '137****3312', status: false, last: '2026-06-12 17:20', mail: 'w***@atlas.io' },
  { id: 4, username: 'liuyang', name: '刘洋', dept: '技术部', role: '开发', roleTone: 'neutral', phone: '135****7754', status: true, last: '2026-06-29 22:03', mail: 'l***@atlas.io' },
  { id: 5, username: 'chenjing', name: '陈静', dept: '财务部', role: '财务', roleTone: 'warning', phone: '136****9901', status: true, last: '2026-06-28 11:33', mail: 'c***@atlas.io' },
  { id: 6, username: 'zhaolei', name: '赵磊', dept: '运营部', role: '运营', roleTone: 'success', phone: '138****2245', status: false, last: '2026-05-30 14:10', mail: 'z***@atlas.io' },
  { id: 7, username: 'sunli', name: '孙丽', dept: '风控部', role: '审计员', roleTone: 'info', phone: '139****6678', status: true, last: '2026-06-30 07:55', mail: 's***@atlas.io' },
];

const ROLES = [
  { id: 1, name: '系统管理员', code: 'admin', tone: 'primary', users: 2, perms: 42, status: true, remark: '拥有全部菜单与按钮权限', created: '2025-01-04' },
  { id: 2, name: '审计员', code: 'auditor', tone: 'info', users: 3, perms: 11, status: true, remark: '仅可查看日志与审计追踪', created: '2025-02-18' },
  { id: 3, name: '运营', code: 'operator', tone: 'success', users: 8, perms: 19, status: true, remark: '用户与字典的日常维护', created: '2025-03-22' },
  { id: 4, name: '财务', code: 'finance', tone: 'warning', users: 4, perms: 9, status: true, remark: '财务相关数据只读', created: '2025-04-11' },
  { id: 5, name: '访客', code: 'guest', tone: 'neutral', users: 1, perms: 3, status: false, remark: '临时只读账户', created: '2025-06-02' },
];

const LOGIN_LOGS = [
  { id: 1, user: 'zhangwei', ip: '10.12.4.51', location: '北京', browser: 'Chrome 138', os: 'macOS', status: 'success', msg: '登录成功', time: '2026-06-30 09:12:03' },
  { id: 2, user: 'unknown', ip: '203.0.113.9', location: '境外', browser: 'curl', os: '—', status: 'fail', msg: '验证码错误', time: '2026-06-30 08:55:41' },
  { id: 3, user: 'lina', ip: '10.12.4.77', location: '上海', browser: 'Edge 138', os: 'Windows', status: 'success', msg: '登录成功', time: '2026-06-30 08:47:12' },
  { id: 4, user: 'wangqiang', ip: '10.12.9.14', location: '深圳', browser: 'Chrome 137', os: 'Windows', status: 'fail', msg: '账户已停用', time: '2026-06-30 08:30:56' },
  { id: 5, user: 'sunli', ip: '10.12.4.63', location: '上海', browser: 'Safari 18', os: 'iOS', status: 'success', msg: '登录成功', time: '2026-06-30 07:55:20' },
  { id: 6, user: 'zhangwei', ip: '198.51.100.2', location: '境外', browser: 'Firefox 129', os: 'Linux', status: 'fail', msg: '密码错误（第3次）', time: '2026-06-29 23:41:08' },
];

const OP_LOGS = [
  { id: 1, user: 'zhangwei', module: '用户管理', action: '新增', method: 'POST', code: 'system:user:add', status: 'success', ms: 84, time: '2026-06-30 09:20:11' },
  { id: 2, user: 'zhangwei', module: '角色管理', action: '分配权限', method: 'PUT', code: 'system:role:assign', status: 'success', ms: 132, time: '2026-06-30 09:18:47' },
  { id: 3, user: 'lina', module: '日志管理', action: '导出', method: 'POST', code: 'monitor:operlog:export', status: 'success', ms: 421, time: '2026-06-30 08:59:02' },
  { id: 4, user: 'wangqiang', module: '用户管理', action: '删除', method: 'DELETE', code: 'system:user:remove', status: 'fail', ms: 26, time: '2026-06-30 08:33:19' },
  { id: 5, user: 'zhangwei', module: '字典管理', action: '编辑', method: 'PUT', code: 'system:dict:edit', status: 'success', ms: 57, time: '2026-06-29 18:22:40' },
];

const MENU_TREE = [
  { key: 'dash', label: '仪表盘', code: 'dashboard', type: 'menu', path: '/dashboard' },
  { key: 'system', label: '系统管理', code: 'system', type: 'dir', children: [
    { key: 'user', label: '用户管理', code: 'system:user:list', type: 'menu', path: '/system/user' },
    { key: 'role', label: '角色管理', code: 'system:role:list', type: 'menu', path: '/system/role' },
    { key: 'menu', label: '菜单管理', code: 'system:menu:list', type: 'menu', path: '/system/menu' },
    { key: 'dict', label: '字典管理', code: 'system:dict:list', type: 'menu', path: '/system/dict' },
  ]},
  { key: 'monitor', label: '日志管理', code: 'monitor', type: 'dir', children: [
    { key: 'login', label: '登录日志', code: 'monitor:logininfor:list', type: 'menu', path: '/monitor/login' },
    { key: 'oper', label: '操作日志', code: 'monitor:operlog:list', type: 'menu', path: '/monitor/oper' },
  ]},
];

const PERM_TREE = [
  { key: 'user', label: '用户管理', code: 'system:user', children: [
    { key: 'user:list', label: '查询', code: 'system:user:list', type: 'button' },
    { key: 'user:add', label: '新增', code: 'system:user:add', type: 'button' },
    { key: 'user:edit', label: '编辑', code: 'system:user:edit', type: 'button' },
    { key: 'user:remove', label: '删除', code: 'system:user:remove', type: 'button' },
    { key: 'user:reset', label: '重置密码', code: 'system:user:resetPwd', type: 'button' },
  ]},
  { key: 'role', label: '角色管理', code: 'system:role', children: [
    { key: 'role:list', label: '查询', code: 'system:role:list', type: 'button' },
    { key: 'role:add', label: '新增', code: 'system:role:add', type: 'button' },
    { key: 'role:assign', label: '分配权限', code: 'system:role:assign', type: 'button' },
  ]},
  { key: 'dict', label: '字典管理', code: 'system:dict', children: [
    { key: 'dict:list', label: '查询', code: 'system:dict:list', type: 'button' },
    { key: 'dict:edit', label: '编辑', code: 'system:dict:edit', type: 'button' },
  ]},
  { key: 'log', label: '日志管理', code: 'monitor:log', children: [
    { key: 'log:login', label: '登录日志', code: 'monitor:logininfor:list', type: 'button' },
    { key: 'log:oper', label: '操作日志', code: 'monitor:operlog:list', type: 'button' },
    { key: 'log:export', label: '日志导出', code: 'monitor:operlog:export', type: 'button' },
  ]},
];

const DICTS = [
  { id: 1, label: '用户状态', code: 'sys_user_status', items: 2, remark: '启用 / 停用', status: true },
  { id: 2, label: '性别', code: 'sys_user_sex', items: 3, remark: '男 / 女 / 未知', status: true },
  { id: 3, label: '操作类型', code: 'sys_oper_type', items: 6, remark: '增删改查导入导出', status: true },
  { id: 4, label: '是否', code: 'sys_yes_no', items: 2, remark: '是 / 否', status: false },
];

Object.assign(window, { ATLAS_DATA: { USERS, ROLES, LOGIN_LOGS, OP_LOGS, MENU_TREE, PERM_TREE, DICTS } });
