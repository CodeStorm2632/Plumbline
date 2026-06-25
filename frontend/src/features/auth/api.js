import { useMutation, useQuery } from "@tanstack/react-query";
import { http } from "../../lib/api/http";
export function useCaptcha() {
    return useQuery({
        queryKey: ["captcha"],
        queryFn: ({ signal }) => http({ url: "/api/auth/captcha", method: "GET", signal }),
        staleTime: 0,
    });
}
export function useLogin() {
    return useMutation({
        mutationFn: (body) => http({ url: "/api/auth/login", method: "POST", data: body }),
        onSuccess: (t) => {
            localStorage.setItem("token", t.access_token);
            localStorage.setItem("roles", JSON.stringify(t.roles));
        },
    });
}
