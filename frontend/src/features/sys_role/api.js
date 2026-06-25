import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "../../lib/api/http";
const KEY = ["sys-roles"];
export function useRoles(q) {
    return useQuery({
        queryKey: [...KEY, q ?? ""],
        queryFn: ({ signal }) => http({ url: "/api/sys/roles", method: "GET", params: { q }, signal }),
    });
}
export function useCreateRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (v) => http({ url: "/api/sys/roles", method: "POST", data: v }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
export function useDeleteRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => http({ url: `/api/sys/roles/${id}`, method: "DELETE" }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
