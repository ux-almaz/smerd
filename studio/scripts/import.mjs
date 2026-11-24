import { createReadStream, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDocuments } from "../seed/index.mjs";

const studioDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(studioDir, "..");
const dryRun = process.argv.includes("--dry-run");

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || line.trim().startsWith("#")) continue;
    const value = match[2].replace(/^["']|["']$/g, "");
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

loadEnv(path.join(studioDir, ".env"));
loadEnv(path.join(repoRoot, ".env"));

function imagePaths(documents) {
  return [...new Set(documents.map((doc) => doc.imagePath).filter(Boolean))];
}

function toDocument(doc, assets) {
  const { imagePath, imageAlt, imageField = "image", ...rest } = doc;
  if (!imagePath || !assets.get(imagePath)) return rest;
  return {
    ...rest,
    [imageField]: {
      _type: "image",
      alt: imageAlt || "",
      asset: { _type: "reference", _ref: assets.get(imagePath) },
    },
  };
}

async function mapPool(items, limit, task) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await task(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function uploadImages(client, paths) {
  const assets = new Map();
  const missing = [];
  const present = paths.filter((rel) => {
    const ok = existsSync(path.join(repoRoot, rel));
    if (!ok) missing.push(rel);
    return ok;
  });

  await mapPool(present, 3, async (rel, index) => {
    const existing = await client.fetch(`*[_type == "sanity.imageAsset" && label == $label][0]._id`, { label: rel });
    if (existing) {
      assets.set(rel, existing);
      console.log(`файл ${index + 1}/${present.length} уже в Sanity: ${rel}`);
      return;
    }
    const asset = await client.assets.upload("image", createReadStream(path.join(repoRoot, rel)), {
      filename: path.basename(rel),
      label: rel,
    });
    assets.set(rel, asset._id);
    console.log(`загружен ${index + 1}/${present.length}: ${rel}`);
  });

  return { assets, missing };
}

async function commit(client, documents) {
  const size = 40;
  for (let offset = 0; offset < documents.length; offset += size) {
    const chunk = documents.slice(offset, offset + size);
    const tx = client.transaction();
    chunk.forEach((doc) => tx.createOrReplace(doc));
    await tx.commit();
    console.log(`записано ${Math.min(offset + size, documents.length)} / ${documents.length}`);
  }
}

const documents = buildDocuments();
const counts = documents.reduce((acc, doc) => {
  const key = doc._type === "galleryImage" ? `gallery:${doc.section}` : doc._type;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
console.log("Документы:");
for (const [type, count] of Object.entries(counts)) console.log(`  ${type}: ${count}`);

const paths = imagePaths(documents);
const missingNow = paths.filter((rel) => !existsSync(path.join(repoRoot, rel)));
if (missingNow.length) {
  console.log("Нет файлов, документы создадутся без картинки:");
  missingNow.forEach((rel) => console.log(`  ${rel}`));
}

if (dryRun) {
  console.log(`Проверка прошла. К загрузке ${paths.length - missingNow.length} изображений и ${documents.length} документов.`);
  process.exit(0);
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error("Нужны SANITY_STUDIO_PROJECT_ID и SANITY_API_WRITE_TOKEN в studio/.env. Образец: studio/.env.example");
  process.exit(1);
}

const { createClient } = await import("@sanity/client");
const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
  timeout: 180000,
});

const { assets, missing } = await uploadImages(client, paths);
if (missing.length) {
  console.log("Без изображения:");
  missing.forEach((rel) => console.log(`  ${rel}`));
}
await commit(client, documents.map((doc) => toDocument(doc, assets)));
console.log("Импорт завершён. Откройте студию: npm run dev --prefix studio");
