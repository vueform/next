import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const MIME: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

export interface StaticServer {
  /** `http://127.0.0.1:<port>` */
  origin: string
  close: () => Promise<void>
}

/**
 * Serves a directory on an ephemeral localhost port. Just enough server for
 * the built app — the measured page must not involve the network beyond
 * loopback.
 */
export function serve(root: string): Promise<StaticServer> {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const file = path.join(root, path.normalize(url.pathname))

    if (!file.startsWith(root) || !fs.existsSync(file)) {
      res.writeHead(404).end()
      return
    }

    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    fs.createReadStream(file).pipe(res)
  })

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0

      resolve({
        origin: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(() => done())),
      })
    })
  })
}
