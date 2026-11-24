import { defineField, defineType } from "sanity";
import { blocksField } from "./blocks.js";

export const series = defineType({
  name: "series",
  title: "Серия",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Адрес",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "filterKey",
      title: "Ключ фильтра в каталоге",
      type: "string",
      description: "Латиница без пробелов: seasons, atharrachadh, union. Меняется только вместе с вёрсткой каталога.",
      validation: (rule) => rule.required().regex(/^[a-z0-9-]+$/),
    }),
    defineField({
      name: "layout",
      title: "Как показывать на главной",
      type: "string",
      options: {
        list: [
          { title: "Слайдер", value: "slider" },
          { title: "Тёмный блок", value: "band" },
          { title: "История", value: "story" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kicker",
      title: "Надзаголовок",
      type: "string",
    }),
    defineField({
      name: "years",
      title: "Годы",
      type: "string",
    }),
    defineField({
      name: "subtitle",
      title: "Подзаголовок",
      type: "string",
    }),
    blocksField("description", "Текст серии"),
    defineField({
      name: "sortOrder",
      title: "Порядок",
      type: "number",
      initialValue: 100,
    }),
  ],
  orderings: [
    { title: "Порядок на сайте", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "years" },
  },
});
