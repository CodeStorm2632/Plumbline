// Auth types matching backend schemas

export interface CaptchaResponse {
  captcha_id: string
  captcha_image: string
}

export interface LoginRequest {
  username: string
  password: string
  captcha_id: string
  captcha_code: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface UserMeResponse {
  id: string
  username: string
  real_name: string | null
  email: string | null
  phone: string | null
  avatar: string | null
  is_superadmin: boolean
  roles: string[]
  permissions: string[]
  menus: MenuNode[]
}

// Menu tree node (recursive)
export interface MenuNode {
  id: string
  parent_id: string | null
  name: string
  menu_type: "DIR" | "MENU" | "BTN"
  permission: string | null
  path: string | null
  component: string | null
  icon: string | null
  sort_order: number
  visible: boolean
  status: number
  children?: MenuNode[]
}

// User management
export interface UserPublic {
  id: string
  username: string
  real_name: string | null
  email: string | null
  phone: string | null
  avatar: string | null
  status: number
  is_superadmin: boolean
  last_login_at: string | null
  last_login_ip: string | null
  created_at: string
  roles?: RolePublic[]
}

export interface UserCreate {
  username: string
  password: string
  real_name?: string
  email?: string
  phone?: string
  status?: number
  role_ids?: string[]
}

export interface UserUpdate {
  real_name?: string
  email?: string
  phone?: string
  status?: number
  role_ids?: string[]
}

// Role management
export interface RolePublic {
  id: string
  name: string
  code: string
  data_scope: string
  status: number
  sort_order: number
  remark: string | null
  created_at: string
}

export interface RoleCreate {
  name: string
  code: string
  data_scope?: string
  status?: number
  sort_order?: number
  remark?: string
}

export interface RoleUpdate {
  name?: string
  code?: string
  data_scope?: string
  status?: number
  sort_order?: number
  remark?: string
}

export interface RoleDetail extends RolePublic {
  menu_ids: string[]
}

// Menu management
export interface MenuPublic {
  id: string
  parent_id: string | null
  name: string
  menu_type: "DIR" | "MENU" | "BTN"
  permission: string | null
  path: string | null
  component: string | null
  icon: string | null
  sort_order: number
  visible: boolean
  status: number
  created_at: string
}

export interface MenuCreate {
  parent_id?: string | null
  name: string
  menu_type: "DIR" | "MENU" | "BTN"
  permission?: string
  path?: string
  component?: string
  icon?: string
  sort_order?: number
  visible?: boolean
  status?: number
}

export interface MenuUpdate {
  parent_id?: string | null
  name?: string
  menu_type?: "DIR" | "MENU" | "BTN"
  permission?: string
  path?: string
  component?: string
  icon?: string
  sort_order?: number
  visible?: boolean
  status?: number
}

// Logs
export interface OperationLogPublic {
  id: string
  user_id: string | null
  username: string | null
  module: string
  action: string
  method: string
  url: string
  ip: string | null
  request_params: string | null
  response_code: number | null
  error_msg: string | null
  cost_time_ms: number | null
  created_at: string | null
}

export interface LoginLogPublic {
  id: string
  username: string
  ip: string | null
  browser: string | null
  os: string | null
  status: number
  fail_reason: string | null
  login_at: string | null
}

// Dashboard
export interface DashboardSummary {
  user_count: number
  role_count: number
  today_login_count: number
  today_operation_count: number
}
