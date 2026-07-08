import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { api, apiGet, apiPost, apiPut, extractErrorMessage } from "@/lib/api"
import type {
  CaptchaResponse,
  LoginRequest,
  TokenResponse,
  UserMeResponse,
} from "@/types"

export const isLoggedIn = () => localStorage.getItem("access_token") !== null

export function useCaptcha() {
  return useQuery<CaptchaResponse>({
    queryKey: ["captcha"],
    queryFn: () => apiGet<CaptchaResponse>("/auth/captcha"),
    refetchOnWindowFocus: false,
  })
}

export function useSm2PublicKey() {
  return useQuery<string>({
    queryKey: ["sm2PublicKey"],
    queryFn: () =>
      apiGet<{ public_key: string }>("/auth/sm2-public-key").then(
        (r) => r.public_key,
      ),
    staleTime: 24 * 60 * 60 * 1000, // public key is stable
    refetchOnWindowFocus: false,
  })
}

export function useCurrentUser() {
  return useQuery<UserMeResponse>({
    queryKey: ["currentUser"],
    queryFn: () => apiGet<UserMeResponse>("/auth/me"),
    enabled: isLoggedIn(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const { sm2 } = await import('sm-crypto')
      const pubKeyResp = await apiGet<{ public_key: string }>("/auth/sm2-public-key")
      const pubKey = pubKeyResp.public_key
      const response = await api.post("/auth/login", {
        ...data,
        username: sm2.doEncrypt(data.username, pubKey, 1),
        password: sm2.doEncrypt(data.password, pubKey, 1),
      })
      return response.data.data as TokenResponse
    },
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token)
      navigate({ to: "/" })
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error))
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => apiPost("/auth/logout"),
    onSettled: () => {
      localStorage.removeItem("access_token")
      queryClient.clear()
      navigate({ to: "/login" })
    },
  })

  const updateMeMutation = useMutation({
    mutationFn: (data: { real_name?: string; email?: string; phone?: string }) =>
      apiPut("/auth/me", data),
    onSuccess: () => {
      toast.success("个人信息更新成功")
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      apiPut("/auth/me/password", data),
    onSuccess: () => {
      toast.success("密码修改成功，请重新登录")
      localStorage.removeItem("access_token")
      queryClient.clear()
      navigate({ to: "/login" })
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  return {
    loginMutation,
    logoutMutation,
    updateMeMutation,
    changePasswordMutation,
  }
}
