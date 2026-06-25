import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sealSensitive } from "../../lib/api/envelope";
import { http } from "../../lib/api/http";
const KEY = ["sys-users"];
export function useUsers(q) {
    return useQuery({
        queryKey: [...KEY, q ?? ""],
        queryFn: ({ signal }) => http({ url: "/api/sys/users", method: "GET", params: { q }, signal }),
    });
}
export function useCreateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input) => 
        // 敏感字段经传输信封加密上送（NFR-6.7）
        http({
            url: "/api/sys/users",
            method: "POST",
            data: sealSensitive(input, ["phone", "email"]),
        }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
export function useDeleteUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => http({ url: `/api/sys/users/${id}`, method: "DELETE" }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
