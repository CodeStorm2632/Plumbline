import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http } from "../../lib/api/http";
const DICT_KEY = ["sys-dicts"];
const ITEM_KEY = ["sys-dict-items"];
export function useDicts(q) {
    return useQuery({
        queryKey: [...DICT_KEY, q ?? ""],
        queryFn: ({ signal }) => http({ url: "/api/sys/dicts", method: "GET", params: { q }, signal }),
    });
}
export function useDictItems(typeCode) {
    return useQuery({
        queryKey: [...ITEM_KEY, typeCode ?? ""],
        enabled: !!typeCode,
        queryFn: ({ signal }) => http({ url: `/api/sys/dicts/${typeCode}/items`, method: "GET", signal }),
    });
}
export function useCreateDict() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (v) => http({ url: "/api/sys/dicts", method: "POST", data: v }),
        onSuccess: () => {
            toast.success("字典类型已创建");
            qc.invalidateQueries({ queryKey: DICT_KEY });
        },
        onError: (e) => toast.error(`创建字典类型失败：${e.message}`),
    });
}
export function useUpdateDict() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (v) => http({ url: `/api/sys/dicts/${v.id}`, method: "PUT", data: v.data }),
        onSuccess: () => {
            toast.success("字典类型已更新");
            qc.invalidateQueries({ queryKey: DICT_KEY });
        },
        onError: (e) => toast.error(`更新字典类型失败：${e.message}`),
    });
}
export function useDeleteDict() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => http({ url: `/api/sys/dicts/${id}`, method: "DELETE" }),
        onSuccess: () => {
            toast.success("字典类型已删除");
            qc.invalidateQueries({ queryKey: DICT_KEY });
            qc.invalidateQueries({ queryKey: ITEM_KEY });
        },
        onError: (e) => toast.error(`删除字典类型失败：${e.message}`),
    });
}
export function useCreateDictItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (v) => http({ url: "/api/sys/dicts/items", method: "POST", data: v }),
        onSuccess: () => {
            toast.success("字典项已创建");
            qc.invalidateQueries({ queryKey: ITEM_KEY });
        },
        onError: (e) => toast.error(`创建字典项失败：${e.message}`),
    });
}
export function useUpdateDictItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (v) => http({ url: `/api/sys/dicts/items/${v.id}`, method: "PUT", data: v.data }),
        onSuccess: () => {
            toast.success("字典项已更新");
            qc.invalidateQueries({ queryKey: ITEM_KEY });
        },
        onError: (e) => toast.error(`更新字典项失败：${e.message}`),
    });
}
export function useDeleteDictItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => http({ url: `/api/sys/dicts/items/${id}`, method: "DELETE" }),
        onSuccess: () => {
            toast.success("字典项已删除");
            qc.invalidateQueries({ queryKey: ITEM_KEY });
        },
        onError: (e) => toast.error(`删除字典项失败：${e.message}`),
    });
}
