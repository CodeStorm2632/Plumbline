import { useMutation, useQuery } from "@tanstack/react-query";
import { http } from "../../lib/api/http";

export type Captcha = { captcha_id: string; image: string; ttl: number };
export type Token = { access_token: string; token_type: string; roles: string[] };

export function useCaptcha() {
  return useQuery({
    queryKey: ["captcha"],
    queryFn: ({ signal }) => http<Captcha>({ url: "/api/auth/captcha", method: "GET", signal }),
    staleTime: 0,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (body: { username: string; password: string; captcha_id: string; captcha_code: string }) =>
      http<Token>({ url: "/api/auth/login", method: "POST", data: body }),
    onSuccess: (t) => localStorage.setItem("token", t.access_token),
  });
}
