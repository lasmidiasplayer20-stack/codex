const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { server } from "./serve.mjs";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, ".."),
  s = server(root);
s.listen(0, "127.0.0.1");
await once(s, "listening");
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: [
    "--no-sandbox",
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
  ],
});
try {
  const p = await b.newPage({ viewport: { width: 640, height: 360 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(
    "http://127.0.0.1:" + s.address().port + "/render.html?width=640",
  );
  await p.waitForFunction(() => window.ready);
  const shots = await p.evaluate(() => film.shots);
  for (const shot of shots) {
    const t = (shot.start + shot.end) / 2;
    const r = await p.evaluate((t) => {
      const r = film.frame(t);
      return {
        ...r,
        image: film.canvas.toDataURL("image/jpeg", 0.95).split(",")[1],
      };
    }, t);
    await writeFile(
      root + "/qa/take-" + String(shot.id).padStart(2, "0") + ".jpg",
      Buffer.from(r.image, "base64"),
    );
  }
  const report = await p.evaluate(() => ({
    stats: film.stats,
    tracking: film.trackingReports(),
  }));
  report.errors = errors;
  await writeFile(root + "/qa/review-r3.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await b.close();
  await new Promise((r) => s.close(r));
}
