import { defineField, defineType } from "sanity";

export const cvItem = defineType({
  name: "cvItem",
  title: "Строка CV",
  type: "document",
  fields: [
    defineField({
      name: "group",
      title: "Группа",
      type: "string",
      options: {
        list: [
          { title: "Образование", value: "education" },
          { title: "Избранные проекты", value: "project" },
          { title: "Выставки", value: "exhibition" },
          { title: "Конкурсы", value: "contest" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "period",
      title: "Год или период",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      title: "Текст",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
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
    select: { title: "period", subtitle: "text" },
  },
});
