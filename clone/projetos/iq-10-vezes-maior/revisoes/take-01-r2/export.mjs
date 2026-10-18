import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = fileURLToPath(new URL(".", import.meta.url));
const audio = process.argv[2]
  ? resolve(process.argv[2])
  : root + "audio-original.m4a";
function run(cmd, args) {
  const p = spawnSync(cmd, args, {
    stdio: "inherit",
    env: process.env,
    cwd: root,
  });
  if (p.status !== 0) throw Error(cmd + " failed: " + p.status);
}
run(process.execPath, [root + "render.mjs", "render"]);
run("ffmpeg", [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-i",
  root + "silent.tmp.mp4",
  "-i",
  audio,
  "-map",
  "0:v:0",
  "-map",
  "1:a:0",
  "-t",
  "4.066666667",
  "-c",
  "copy",
  "-movflags",
  "+faststart",
  root + "preview-take-01-r2.mp4",
]);
