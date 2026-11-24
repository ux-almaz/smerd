import { defineField, defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Отзыв",
  type: "document",
  fields: [
    defineField({
      name: "category",
      title: "Раздел",
      type: "string",
      options: {
        list: [
          { title: "Детские группы", value: "kids" },
          { title: "Взрослые", value: "adults" },
          { title: "Заказчики", value: "clients" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      title: "Текст",
      type: "text",
      rows: 8,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Имя",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "visible",
      title: "Показывать на сайте",
      type: "boolean",
      initialValue: true,
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
    select: { title: "author", subtitle: "category" },
    prepare({ title, subtitle }) {
      const labels = { kids: "Детские группы", adults: "Взрослые", clients: "Заказчики" };
      return { title, subtitle: labels[subtitle] || subtitle };
    },
  },
});
