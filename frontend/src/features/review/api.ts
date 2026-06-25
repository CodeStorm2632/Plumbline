import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "../../lib/api/http";

export type RankingItem = { id: string; name: string; total: number; qc_confirmed: boolean; veto: boolean };
export type EvalResult = { applicant_id: string; total: number; veto: boolean; breakdown: Record<string, number> };

export const rankingsKey = () => ["rankings"] as const;

export function useRankings() {
  return useQuery({
    queryKey: rankingsKey(),
    queryFn: ({ signal }) => http<RankingItem[]>({ url: "/api/rankings", method: "GET", signal }),
    staleTime: 30_000,
  });
}

export function useQcClaim(applicantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: { claimId: string; delta: number; reason: string }) =>
      http<EvalResult>({ url: `/api/applicants/${applicantId}/qc/${b.claimId}`, method: "POST",
                        data: { delta: b.delta, reason: b.reason } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["evaluation", applicantId] });
      qc.invalidateQueries({ queryKey: rankingsKey() });
      qc.invalidateQueries({ queryKey: ["audit", applicantId] });
    },
  });
}
