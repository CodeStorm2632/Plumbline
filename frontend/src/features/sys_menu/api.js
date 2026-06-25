import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http } from "../../lib/api/http";
const KEY = ["sys-menus"];
export function useMenus() {
    return useQuery({
        queryKey: KEY,
        queryFn: ({ signal }) => http({ url: "/api/sys/menus", method: "GET", signal }),
    });
}
export function useCreateMenu() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (v) => http({ url: "/api/sys/menus", method: "POST", data: v }),
        onSuccess: () => {
            toast.success("菜单节点已创建");
            qc.invalidateQueries({ queryKey: KEY });
        },
        onError: (e) => toast.error(`创建菜单失败：${e.message}`),
    });
}
export function useUpdateMenu() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (v) => http({ url: `/api/sys/menus/${v.id}`, method: "PUT", data: v.data }),
        onSuccess: () => {
            toast.success("菜单节点已更新");
            qc.invalidateQueries({ queryKey: KEY });
        },
        onError: (e) => toast.error(`更新菜单失败：${e.message}`),
    });
}
export function useDeleteMenu() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => http({ url: `/api/sys/menus/${id}`, method: "DELETE" }),
        onSuccess: () => {
            toast.success("菜单节点已删除");
            qc.invalidateQueries({ queryKey: KEY });
        },
        onError: (e) => toast.error(`删除菜单失败：${e.message}`),
    });
}
