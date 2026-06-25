// 兼容两种调用形态：
//   1) 单参数对象：http({url, method, params, data, signal})   — 业务/测试在用
//   2) 双参数：    http(url, init)                              — orval 7.21 fetch client 生成的代码在用
// 三条不可破坏的语义：注入 Bearer / 非 2xx 抛错 / 401 清 token。
const BASE = import.meta.env.VITE_API_BASE ?? "";
function authHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}
export async function http(a, b) {
    // 归一两种调用形态 → (url, opts: HttpInit)。
    let url;
    let opts;
    if (typeof a === "string") {
        url = a;
        opts = b instanceof AbortSignal ? { signal: b } : (b ?? {});
    }
    else {
        url = a.url;
        opts = {
            method: a.method,
            params: a.params,
            data: a.data,
            signal: a.signal,
            headers: a.headers,
        };
    }
    const u = new URL(url, location.origin);
    if (opts.params)
        for (const [k, v] of Object.entries(opts.params))
            if (v != null)
                u.searchParams.set(k, String(v));
    const res = await fetch(BASE + u.pathname + u.search, {
        ...opts,
        method: opts.method ?? "GET",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
            ...opts.headers,
        },
        body: opts.data !== undefined ? JSON.stringify(opts.data) : opts.body,
    });
    if (res.status === 401)
        localStorage.removeItem("token");
    if (!res.ok)
        throw new Error(`${res.status} ${await res.text()}`);
    return (res.status === 204 ? undefined : await res.json());
}
