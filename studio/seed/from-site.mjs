import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function readIndex() {
  return readFileSync(path.join(repoRoot, "index.html"), "utf8");
}

function decode(value) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function sliceSection(html, id) {
  const marker = `id="${id}"`;
  const at = html.indexOf(marker);
  if (at < 0) throw new Error(`На странице нет раздела #${id}`);
  const from = html.lastIndexOf("<section", at);
  const next = html.indexOf("<section", at + marker.length);
  return html.slice(from, next === -1 ? html.length : next);
}

function figures(sectionHtml) {
  const out = [];
  const re = /<figure class="tile">([\s\S]*?)<\/figure>/g;
  for (const match of sectionHtml.matchAll(re)) {
    const block = match[1];
    const href = block.match(/href="([^"]+)"/);
    const caption = block.match(/data-caption="([^"]*)"/);
    const alt = block.match(/<img[^>]*alt="([^"]*)"/);
    const spans = [...block.matchAll(/<span(?: class="note")?>([^<]*)<\/span>/g)].map((item) => decode(item[1]));
    if (!href) throw new Error("У листа в галерее нет файла");
    out.push({
      imagePath: href[1],
      title: spans[0] || "",
      detail: spans[1] || "",
      caption: decode(caption?.[1] || spans[0] || ""),
      alt: decode(alt?.[1] || spans[0] || ""),
    });
  }
  return out;
}

function galleryDocuments(items, section) {
  return items.map((item, index) => {
    const base = item.imagePath.split("/").pop().replace(/\.[a-z0-9]+$/i, "");
    return {
      _id: `gallery-${section}-${base}`,
      _type: "galleryImage",
      section,
      title: item.title,
      detail: item.detail || undefined,
      caption: item.caption || undefined,
      visible: true,
      sortOrder: (index + 1) * 10,
      imagePath: item.imagePath,
      imageAlt: item.alt,
    };
  });
}

export function galleryFromSite(html) {
  const drawing = sliceSection(html, "drawing");
  const blocks = drawing.split('<div class="gallery-block">').slice(1);
  if (blocks.length < 2) throw new Error("В разделе «Рисунок» не нашлись две галереи");
  const academic = galleryDocuments(figures(blocks[0]), "academic");
  const diary = galleryDocuments(figures(blocks[1]), "diary");
  const students = galleryDocuments(figures(sliceSection(html, "students")), "student");
  if (!academic.length || !diary.length || !students.length) {
    throw new Error("Галереи разобрались пустыми. Проверьте вёрстку index.html.");
  }
  return [...academic, ...diary, ...students];
}

const reviewCategory = {
  "Детские группы": "kids",
  Взрослые: "adults",
  Заказчики: "clients",
};

export function reviewsFromSite(html) {
  const section = sliceSection(html, "reviews");
  const chunks = section.split("data-reviews-panel").slice(1);
  const docs = [];
  for (const chunk of chunks) {
    const heading = decode(chunk.match(/reviews__panel-title">([^<]+)/)?.[1] || "");
    const category = reviewCategory[heading];
    if (!category) throw new Error(`Неизвестный раздел отзывов: ${heading}`);
    const quotes = [...chunk.matchAll(/<blockquote class="review">([\s\S]*?)<\/blockquote>/g)];
    quotes.forEach((quote, index) => {
      const text = decode(quote[1].match(/<p>([\s\S]*?)<\/p>/)?.[1] || "");
      const author = decode(quote[1].match(/<cite>([^<]*)<\/cite>/)?.[1] || "");
      if (!text || !author) throw new Error(`Пустой отзыв в разделе ${heading}`);
      docs.push({
        _id: `review-${category}-${index + 1}`,
        _type: "review",
        category,
        text,
        author,
        visible: true,
        sortOrder: (index + 1) * 10,
      });
    });
  }
  if (!docs.length) throw new Error("Отзывы не разобрались");
  return docs;
}

const cvGroup = {
  "Избранные проекты": "project",
  Выставки: "exhibition",
  Конкурсы: "contest",
};

export function cvFromSite(html) {
  const section = sliceSection(html, "cv");
  const education = [...section.matchAll(/<div class="edu-item">\s*<p[^>]*>([^<]*)<\/p>\s*<p>([\s\S]*?)<\/p>/g)].map(
    (match, index) => ({
      _id: `cv-education-${index + 1}`,
      _type: "cvItem",
      group: "education",
      period: decode(match[1]),
      text: decode(match[2]),
      sortOrder: (index + 1) * 10,
    }),
  );
  if (!education.length) throw new Error("Блок образования не разобрался");

  const shows = section.slice(section.indexOf('<div class="shows">'));
  const docs = [];
  for (const part of shows.split('<p class="kicker">').slice(1)) {
    const heading = decode(part.match(/^([^<]+)/)?.[1] || "");
    const group = cvGroup[heading];
    if (!group) continue;
    const entries = [...part.matchAll(/<article class="entry">\s*<p class="entry__year">([^<]*)<\/p>\s*<p>([\s\S]*?)<\/p>/g)];
    entries.forEach((entry, index) => {
      docs.push({
        _id: `cv-${group}-${index + 1}`,
        _type: "cvItem",
        group,
        period: decode(entry[1]),
        text: decode(entry[2]),
        sortOrder: (index + 1) * 10,
      });
    });
  }
  if (!docs.length) throw new Error("Выставки не разобрались");
  return [...education, ...docs];
}
