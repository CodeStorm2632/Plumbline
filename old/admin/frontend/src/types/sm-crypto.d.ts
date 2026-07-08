declare module 'sm-crypto' {
  export const sm2: {
    doEncrypt(msg: string, publicKey: string, cipherMode?: 0 | 1): string
    doDecrypt(ciphertext: string, privateKey: string, cipherMode?: 0 | 1): string
  }
  export const sm3: {
    (data: string): string
  }
  export const sm4: {
    encrypt(data: string, key: string): string
    decrypt(data: string, key: string): string
  }
}
