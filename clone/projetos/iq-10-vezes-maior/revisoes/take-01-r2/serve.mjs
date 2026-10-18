import http from "node:http";
import { stat, readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
export function server(root) {
  return http.createServer(async (req, res) => {
    try {
      const path = decodeURIComponent((req.url || "/").split("?")[0]),
        p = resolve(root, "." + (path === "/" ? "/index.html" : path));
      if (!p.startsWith(resolve(root) + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const s = await stat(p),
        types = {
          ".html": "text/html",
          ".js": "text/javascript",
          ".json": "application/json",
          ".mp4": "video/mp4",
          ".m4a": "audio/mp4",
          ".gz": "application/gzip",
          ".jpg": "image/jpeg",
        };
      const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
      res.setHeader(
        "Content-Type",
        types[extname(p)] || "application/octet-stream",
      );
      res.setHeader("Accept-Ranges", "bytes");
      if (range) {
        const start = +range[1],
          end = Math.min(s.size - 1, range[2] ? +range[2] : s.size - 1);
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${s.size}`,
          "Content-Length": end - start + 1,
        });
        createReadStream(p, { start, end }).pipe(res);
      } else {
        res.writeHead(200, { "Content-Length": s.size });
        createReadStream(p).pipe(res);
      }
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const s = server(resolve(import.meta.dirname));
  s.listen(8080, "127.0.0.1", () => console.log("http://127.0.0.1:8080"));
}
