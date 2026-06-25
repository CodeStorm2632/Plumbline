import { toast } from "sonner";
import { useQcClaim, useRankings } from "./api";

// 复核台：覆盖 SC §5 七态（加载/错误/空/无权限/未确认/否决/成功）。
export function ReviewPage({ roles }: { roles: string[] }) {
  const { data, isLoading, isError, error, refetch } = useRankings();
  const canWrite = roles.includes("评审专家") || roles.includes("管理员"); // 无权限：隐藏写操作

  if (isError)
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4">
        加载失败：{String((error as Error).message)}
        <button className="ml-2 underline" onClick={() => refetch()}>重试</button>
      </div>
    );
  if (isLoading)
    return <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-10 w-full animate-pulse rounded bg-gray-100" />))}</div>;
  if (!data || data.length === 0)
    return <div className="rounded border p-10 text-center text-gray-400">暂无可复核数据</div>;

  return (
    <div className="space-y-2">
      {data.map((row) => <Row key={row.id} row={row} canWrite={canWrite} />)}
    </div>
  );
}

function Row({ row, canWrite }: { row: ReturnType<typeof useRankings>["data"] extends (infer T)[] | undefined ? T : never; canWrite: boolean }) {
  const qc = useQcClaim(row.id);
  return (
    <div className="flex items-center gap-3 border-b py-2">
      <span className="font-medium">{row.name}</span>
      <span className="tabular-nums">{row.total}</span>
      {row.veto && <span className="rounded bg-red-600 px-2 text-xs text-white">一票否决·不计入排序</span>}
      {!row.qc_confirmed && <span className="rounded border px-2 text-xs text-gray-500">未确认</span>}
      {canWrite && (
        <button className="ml-auto rounded border px-3 py-1 text-sm disabled:opacity-40"
          disabled={row.veto || qc.isPending}
          onClick={() => qc.mutate({ claimId: "c1", delta: 1, reason: "复核确认" },
            { onSuccess: () => toast.success("已质检并重算") })}>
          质检
        </button>
      )}
    </div>
  );
}
