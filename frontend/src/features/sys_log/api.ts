import { useQuery } from "@tanstack/react-query";

import { http } from "../../lib/api/http";

export type AuditLog = {
  id: number;
  entity_id: string;
  actor: string;
  action: string;
  reason: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  ts: string;
};

export type LoginLog = {
  id: number;
  username: string;
  success: boolean;
  ip: string;
  user_agent: string;
  detail: string;
  ts: string;
};

export function useAuditLogs(params: { entity_id?: string; actor?: string }) {
  return useQuery({
    queryKey: ["sys-logs", "audit", params],
    queryFn: ({ signal }) =>
      http<AuditLog[]>({ url: "/api/sys/logs/audit", method: "GET", params, signal }),
  });
}

export function useLoginLogs(params: { username?: string }) {
  return useQuery({
    queryKey: ["sys-logs", "login", params],
    queryFn: ({ signal }) =>
      http<LoginLog[]>({ url: "/api/sys/logs/login", method: "GET", params, signal }),
  });
}
