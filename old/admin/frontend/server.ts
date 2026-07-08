import path from "node:path"

const distDir = path.join(import.meta.dir, "dist")
const port = Number(process.env.PORT ?? 80)

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
])

function resolveAssetPath(requestPath: string): string {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath
  const candidatePath = path.normalize(path.join(distDir, normalizedPath))

  if (!candidatePath.startsWith(distDir)) {
    return path.join(distDir, "index.html")
  }

  return candidatePath
}

function responseHeaders(filePath: string): Headers {
  const headers = new Headers()
  const extension = path.extname(filePath)
  const contentType = contentTypes.get(extension)

  if (contentType) {
    headers.set("Content-Type", contentType)
  }

  if (
    filePath.includes(`${path.sep}assets${path.sep}`) ||
    extension === ".js" ||
    extension === ".css"
  ) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable")
  }

  return headers
}

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url)
    const assetPath = resolveAssetPath(url.pathname)
    const assetFile = Bun.file(assetPath)

    if (await assetFile.exists()) {
      return new Response(assetFile, {
        headers: responseHeaders(assetPath),
      })
    }

    const indexPath = path.join(distDir, "index.html")
    return new Response(Bun.file(indexPath), {
      headers: responseHeaders(indexPath),
    })
  },
})

console.log(`MatrixAdmin frontend listening on :${port}`)