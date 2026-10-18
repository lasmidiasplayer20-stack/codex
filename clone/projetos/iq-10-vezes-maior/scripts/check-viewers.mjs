import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { server } from "./serve.mjs";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
const root = fileURLToPath(new URL("..", import.meta.url)),
  s = server(root);
s.listen(0, "127.0.0.1");
await once(s, "listening");
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM || (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: [
    "--no-sandbox",
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
  ],
});
const results = { frames: [], errors: [] };
try {
  const p = await b.newPage();
  p.on("pageerror", (e) => results.errors.push(String(e)));
  await p.goto("http://127.0.0.1:" + s.address().port + "/rastreamento.html");
  for (const f of [0, 121, 122, 200, 1799, 1800, 5000, 9000, 15000, 15758]) {
    await p.locator("#seek").evaluate((el, f) => {
      el.value = f;
      el.dispatchEvent(new Event("input"));
    }, f);
    await p.waitForFunction(
      (f) =>
        document
          .getElementById("readout")
          .textContent.includes("quadro " + (f + 1) + " /"),
      f,
    );
    const text = await p.locator("#readout").textContent();
    results.frames.push({ f, text });
    if (await p.locator("#error").textContent())
      throw Error(await p.locator("#error").textContent());
  }
  if (process.env.SOURCE_VIDEO) {
    await p.locator("#file").setInputFiles(process.env.SOURCE_VIDEO);
    await p.waitForFunction(() =>
      document.getElementById("fileStatus").textContent.includes("525."),
    );
    results.localSourceLoaded = true;
  }
  await p.goto("http://127.0.0.1:" + s.address().port + "/editor.html");
  await p.waitForFunction(() => window.ready);
  await p.locator("#seek").evaluate((el) => {
    el.value = "52.3";
    el.dispatchEvent(new Event("input"));
  });
  results.editor = await p.locator("#status").textContent();
  results.passed =
    results.errors.length === 0 &&
    results.frames.length === 10 &&
    results.editor.includes("take 31");
  await writeFile(root + "/qa/viewers.json", JSON.stringify(results, null, 2));
  console.log(
    JSON.stringify({
      passed: results.passed,
      framesTested: results.frames.length,
      localSourceLoaded: results.localSourceLoaded,
      editor: results.editor,
      errors: results.errors,
    }),
  );
  if (!results.passed) process.exitCode = 1;
} finally {
  await b.close();
  await new Promise((r) => s.close(r));
}
