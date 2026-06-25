// 传输信封（NFR-6.7）：敏感字段在请求体内的国密加密 seam，叠加在 TLS 之上。
//
// 当前 scaffold 为「透传占位」：直接回传原值。后端 open_envelope 同时兼容明文与 SM4 信封，
// 因此 dev 下不加密也能跑通。生产硬化：先 fetchPubKey() 取 SM2 公钥，再用 SM2 加密
// 指定敏感字段（如 sm-crypto 库），服务端私钥解密——只需替换 sealSensitive 内部实现。
import { http } from "./http";

export type PubKey = { backend: string; sm2_public_key: string | null };

export function fetchPubKey(): Promise<PubKey> {
  return http<PubKey>({ url: "/api/crypto/pubkey", method: "GET" });
}

/** 对 values 中 fields 指定的敏感字段做信封加密（scaffold：透传；prod：SM2 加密）。 */
export function sealSensitive<T extends Record<string, unknown>>(
  values: T,
  _fields: (keyof T)[],
): T {
  return values;
}
