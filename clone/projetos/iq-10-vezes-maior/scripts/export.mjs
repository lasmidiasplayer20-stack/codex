import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { stat } from "node:fs/promises";
const root = resolve(import.meta.dirname, ".."),
  source = process.argv[2] || process.env.SOURCE_VIDEO || resolve(root,"audio/preview-original.m4a");
if (!source)
  throw Error(
    "Informe o MP4 original: npm run export -- /caminho/original.mp4",
  );
await stat(source);
function run(cmd, args) {
  return new Promise((ok, no) => {
    const p = spawn(cmd, args, { cwd: root, stdio: "inherit" });
    p.on("error", no);
    p.on("exit", (code) =>
      code === 0 ? ok() : no(Error(cmd + " terminou com código " + code)),
    );
  });
}
await run(process.execPath, ["scripts/render-preview.mjs", "render"]);
await run("ffmpeg", [
  "-hide_banner",
  "-loglevel",
  "error",
  "-i",
  "previas/preview-60s-silent.tmp.mp4",
  "-i",
  resolve(source),
  "-map",
  "0:v:0",
  "-map",
  "1:a:0",
  "-c",
  "copy",
  "-t",
  "60",
  "-movflags",
  "+faststart",
  "-y",
  "previas/preview-60s-r3-720p60.mp4",
]);
console.log("Prévia com áudio: previas/preview-60s-r3-720p60.mp4");
