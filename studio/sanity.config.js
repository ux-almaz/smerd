import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes/index.js";
import { structure } from "./structure.js";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

const galleryTemplate = (id, title, section) => ({
  id,
  title,
  schemaType: "galleryImage",
  value: { section, visible: true },
});

const reviewTemplate = (id, title, category) => ({
  id,
  title,
  schemaType: "review",
  value: { category, visible: true },
});

export default defineConfig({
  name: "smerd",
  title: "SMERD.ART",
  projectId: projectId || "missingid",
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      galleryTemplate("gallery-academic", "Академический рисунок", "academic"),
      galleryTemplate("gallery-diary", "Лист арт-дневника", "diary"),
      galleryTemplate("gallery-student", "Работа студента", "student"),
      reviewTemplate("review-kids", "Отзыв · детские группы", "kids"),
      reviewTemplate("review-adults", "Отзыв · взрослые", "adults"),
      reviewTemplate("review-clients", "Отзыв · заказчики", "clients"),
    ],
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter((template) => template.templateId !== "siteSettings");
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      if (schemaType === "siteSettings") {
        return prev.filter(({ action }) => action !== "duplicate" && action !== "delete" && action !== "unpublish");
      }
      return prev;
    },
  },
});
