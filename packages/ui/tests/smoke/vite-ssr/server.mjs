/**
 * Minimal production SSR server over the built output: static assets from
 * dist/client, everything else server-rendered through dist/server. Listens on
 * 127.0.0.1:SMOKE_PORT (the smoke serve contract). Dependency-free on purpose —
 * this is what a bare-bones user SSR setup looks like.
 */
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const clientDir = path.join(root, 'dist', 'client')
const template = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf8')
const { render } = await import('./dist/server/entry-server.js')

const MIME = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}

const server = http.createServer(async (req, res) => {
  const url = (req.url ?? '/').split('?')[0]

  const assetPath = path.join(clientDir, url)
  if (
    url !== '/' &&
    assetPath.startsWith(clientDir + path.sep) &&
    fs.existsSync(assetPath) &&
    fs.statSync(assetPath).isFile()
  ) {
    res.setHeader(
      'Content-Type',
      MIME[path.extname(assetPath)] ?? 'application/octet-stream'
    )
    fs.createReadStream(assetPath).pipe(res)
    return
  }

  try {
    const appHtml = await render()
    const html = template.replace('<!--app-html-->', appHtml)
    res.setHeader('Content-Type', 'text/html')
    res.end(html)
  } catch (error) {
    console.error(error)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

const port = Number(process.env.SMOKE_PORT) || 4173
server.listen(port, '127.0.0.1', () => {
  console.log(`ssr server listening on http://127.0.0.1:${port}`)
})
