import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cvFromSite, galleryFromSite, readIndex, reviewsFromSite } from "./from-site.mjs";
import { seriesDocs, settingsDoc, textsToCheck, workDocs } from "./editorial.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function compact(html) {
  return html.replace(/\s+/g, "");
}

function assertSiteCopy() {
  const source = `${readIndex()}\n${readFileSync(path.join(repoRoot, "catalog.html"), "utf8")}`;
  const raw = compact(source);
  const text = compact(source.replace(/<[^>]+>/g, ""));
  const missing = textsToCheck().filter((line) => {
    const needle = compact(line);
    return !raw.includes(needle) && !text.includes(needle);
  });
  if (missing.length) {
    throw new Error(
      `Тексты для Sanity не найдены на сайте:\n${missing.map((line) => `— ${line.slice(0, 160)}`).join("\n")}`,
    );
  }
}

function assertPrices() {
  const source = readFileSync(path.join(repoRoot, "data", "works.js"), "utf8");
  for (const doc of workDocs) {
    if (doc.availability !== "forSale") continue;
    const pattern = new RegExp(`${doc.cartId}:[\\s\\S]*?price:\\s*${doc.price}\\b`);
    if (!pattern.test(source)) {
      throw new Error(`Цена или ключ «${doc.cartId}» не совпадает с data/works.js`);
    }
  }
}

export function buildDocuments() {
  const html = readIndex();
  assertSiteCopy();
  assertPrices();
  const documents = [
    settingsDoc,
    ...seriesDocs,
    ...workDocs,
    ...galleryFromSite(html),
    ...reviewsFromSite(html),
    ...cvFromSite(html),
  ];
  const ids = new Set();
  for (const doc of documents) {
    if (ids.has(doc._id)) throw new Error(`Повторяется документ ${doc._id}`);
    ids.add(doc._id);
  }
  return documents;
}
