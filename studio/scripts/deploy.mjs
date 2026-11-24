import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const studioDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = readFileSync(path.join(studioDir, ".env"), "utf8");
const val = (key) => envFile.match(new RegExp("^" + key + "=(.*)$", "m"))[1].trim();

const child = spawn("npx", ["sanity", "deploy", "--url", "smerd", "--yes"], {
  cwd: studioDir,
  env: {
    ...process.env,
    SANITY_AUTH_TOKEN: val("SANITY_API_WRITE_TOKEN"),
    SANITY_STUDIO_PROJECT_ID: val("SANITY_STUDIO_PROJECT_ID"),
    SANITY_STUDIO_DATASET: val("SANITY_STUDIO_DATASET"),
  },
  shell: true,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
