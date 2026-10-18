const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { server } from "./serve.mjs";
import { once } from "node:events";
import { writeFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url)),
  mode = process.argv[2] || "audit",
  width = mode === "render" ? 1280 : 960,
  s = server(root);
await mkdir(root + "/qa", { recursive: true });
s.listen(0, "127.0.0.1");
await once(s, "listening");
const b = await chromium.launch({
  ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}),
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
  ],
});
let ff,
  done,
  err = "";
try {
  const p = await b.newPage({ viewport: { width, height: (width * 9) / 16 } }),
    errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(
    "http://127.0.0.1:" + s.address().port + "/index.html?render=1&w=" + width,
  );
  await p.waitForFunction(() => window.ready);
  if (mode === "render") {
    ff = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-framerate",
        "60",
        "-f",
        "image2pipe",
        "-vcodec",
        "mjpeg",
        "-i",
        "pipe:0",
        "-c:v",
        "libx264",
        "-threads",
        "2",
        "-preset",
        "fast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-y",
        root + "/silent.tmp.mp4",
      ],
      { stdio: ["pipe", "ignore", "pipe"] },
    );
    ff.stderr.on("data", (d) => (err += d));
    done = new Promise((r) => ff.on("close", r));
  }
  for (let i = 0; i < 244; i++) {
    const draw = mode === "render" || i % 12 === 0;
    if (draw) {
      const r = await p.evaluate((t) => {
        const r = film.frame(t);
        return {
          ...r,
          image: film.canvas.toDataURL("image/jpeg", 0.96).split(",")[1],
        };
      }, i / 60);
      if (mode === "render") {
        if (!ff.stdin.write(Buffer.from(r.image, "base64")))
          await once(ff.stdin, "drain");
      } else
        await writeFile(
          root + "/qa/new-" + String(i).padStart(3, "0") + ".jpg",
          Buffer.from(r.image, "base64"),
        );
    } else await p.evaluate((t) => film.frame(t, { draw: false }), i / 60);
    if (i % 60 === 0) console.log(JSON.stringify({ mode, frame: i }));
  }
  if (ff) {
    ff.stdin.end();
    if ((await done) !== 0) throw Error(err);
  }
  const stats = await p.evaluate(() => film.stats);
  await writeFile(
    root + "/qa/" + mode + ".json",
    JSON.stringify({ stats, errors }, null, 2),
  );
  console.log(JSON.stringify({ stats, errors }));
} finally {
  await b.close();
  await new Promise((r) => s.close(r));
}
