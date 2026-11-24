import { defineField, defineType } from "sanity";
import { imageField } from "./image.js";

export const galleryImage = defineType({
  name: "galleryImage",
  title: "Лист",
  type: "document",
  fields: [
    defineField({
      name: "section",
      title: "Раздел",
      type: "string",
      options: {
        list: [
          { title: "Академический рисунок", value: "academic" },
          { title: "Арт-дневник", value: "diary" },
          { title: "Работы студентов", value: "student" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Подпись",
      type: "string",
      description: "Название листа, дата дневника или имя ученика.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      title: "Техника и формат",
      type: "string",
    }),
    defineField({
      name: "caption",
      title: "Подпись в увеличенном просмотре",
      type: "string",
    }),
    imageField("image", "Изображение"),
    defineField({
      name: "visible",
      title: "Показывать на сайте",
      type: "boolean",
      description: "Снимите галочку, если лист нужно убрать с сайта и оставить в архиве. Так снимают работу студента по просьбе родителя.",
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
    select: { title: "title", subtitle: "detail", media: "image" },
  },
});
