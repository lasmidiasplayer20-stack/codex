import { existsSync } from "node:fs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { once } from "node:events";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { server as makeServer } from "./serve.mjs";
const root = resolve(import.meta.dirname, ".."),
  mode = process.argv[2] || "audit",
  width = mode === "audit" ? 640 : 960,
  begin = Date.now();
await mkdir(root + "/qa", { recursive: true });
const server = makeServer(root);
server.listen(0, "127.0.0.1");
await once(server, "listening");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
  ],
});
let ff,
  complete,
  err = "",
  pipeError;
try {
  const page = await browser.newPage({
      viewport: { width, height: (width * 9) / 16 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(
    `http://127.0.0.1:${server.address().port}/render.html?width=${width}`,
  );
  await page
    .waitForFunction(() => window.ready)
    .catch((e) => {
      console.log(JSON.stringify({ errors }));
      throw e;
    });
  if (mode === "render") {
    await mkdir(root + "/previas", { recursive: true });
    ff = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "image2pipe",
        "-vcodec",
        "mjpeg",
        "-framerate",
        "60",
        "-i",
        "pipe:0",
        "-vf",
        "scale=1280:720:flags=lanczos:in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p",
        "-c:v",
        "libx264",
        "-threads",
        "2",
        "-preset",
        "fast",
        "-crf",
        "22",
        "-maxrate",
        "1400k",
        "-bufsize",
        "2800k",
        "-pix_fmt",
        "yuv420p",
        "-color_range",
        "tv",
        "-colorspace",
        "bt709",
        "-color_primaries",
        "bt709",
        "-color_trc",
        "bt709",
        "-an",
        "-movflags",
        "+faststart",
        "-y",
        root + "/previas/preview-60s-silent.tmp.mp4",
      ],
      { stdio: ["pipe", "ignore", "pipe"] },
    );
    ff.stderr.on("data", (d) => (err += d));
    ff.stdin.on("error", (e) => (pipeError = e));
    complete = new Promise((r) => ff.on("close", r));
  }
  const n = mode === "bench" ? 120 : 3600;
  for (let i = 0; i < n; i++) {
    if (mode === "audit") {
      if (i % 120 === 0) {
        const data = await page.evaluate((t) => {
          film.frame(t);
          return film.canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
        }, i / 60);
        await writeFile(
          `${root}/qa/audit-${String(i).padStart(4, "0")}.jpg`,
          Buffer.from(data, "base64"),
        );
      } else await page.evaluate((t) => film.frame(t, { draw: false }), i / 60);
    } else {
      const data = await page.evaluate((t) => {
        film.frame(t);
        return film.canvas.toDataURL("image/jpeg", 0.94).split(",")[1];
      }, i / 60);
      if (mode === "render") {
        if (pipeError) throw pipeError;
        if (!ff.stdin.write(Buffer.from(data, "base64")))
          await once(ff.stdin, "drain");
      }
    }
    if (i % 300 === 0)
      console.log(
        JSON.stringify({
          mode,
          frame: i,
          frames: n,
          seconds: (Date.now() - begin) / 1000,
        }),
      );
  }
  if (ff) {
    ff.stdin.end();
    if ((await complete) !== 0) throw Error(err);
  }
  const report = await page.evaluate(() => ({
    stats: film.stats,
    tracking: film.trackingReports(),
    shots: film.shots,
  }));
  report.errors = errors;
  report.renderedFrames = n;
  report.mode = mode;
  report.seconds = (Date.now() - begin) / 1000;
  report.passed =
    errors.length === 0 &&
    report.stats.finite &&
    report.stats.maxBoneError < 1e-6 &&
    report.stats.maxReachError < 0.01;
  await writeFile(`${root}/qa/${mode}.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      mode,
      passed: report.passed,
      stats: report.stats,
      tracking: report.tracking,
      seconds: report.seconds,
    }),
  );
  if (!report.passed) process.exitCode = 1;
} finally {
  if (ff && !ff.killed) ff.stdin.end();
  await browser.close();
  await new Promise((r) => server.close(r));
}
