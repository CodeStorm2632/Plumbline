import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { http } from "../../lib/api/http";

export type SysRole = {
  id: string;
  code: string;
  name: string;
  remark: string;
  menu_ids: string[];
};

const KEY = ["sys-roles"];

export function useRoles(q?: string) {
  return useQuery({
    queryKey: [...KEY, q ?? ""],
    queryFn: ({ signal }) =>
      http<SysRole[]>({ url: "/api/sys/roles", method: "GET", params: { q }, signal }),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { code: string; name: string; remark?: string }) =>
      http<SysRole>({ url: "/api/sys/roles", method: "POST", data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http<void>({ url: `/api/sys/roles/${id}`, method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** 分配菜单/权限给角色 — FR-6.2.4 */
export function useAssignMenus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, menuIds }: { roleId: string; menuIds: string[] }) =>
      http<SysRole>({
        url: `/api/sys/roles/${roleId}/menus`,
        method: "POST",
        data: { menu_ids: menuIds },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

