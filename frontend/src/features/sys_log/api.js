import { useQuery } from "@tanstack/react-query";
import { http } from "../../lib/api/http";
export function useAuditLogs(params) {
    return useQuery({
        queryKey: ["sys-logs", "audit", params],
        queryFn: ({ signal }) => http({ url: "/api/sys/logs/audit", method: "GET", params, signal }),
    });
}
export function useLoginLogs(params) {
    return useQuery({
        queryKey: ["sys-logs", "login", params],
        queryFn: ({ signal }) => http({ url: "/api/sys/logs/login", method: "GET", params, signal }),
    });
}
