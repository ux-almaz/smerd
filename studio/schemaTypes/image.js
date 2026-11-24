import { defineField } from "sanity";

export function imageField(name, title, { required = true, group } = {}) {
  return defineField({
    name,
    title,
    group,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Описание изображения",
        type: "string",
        description: "Коротко, что на картинке. Попадает в alt.",
        validation: (rule) => rule.required(),
      }),
    ],
    validation: required ? (rule) => rule.required() : undefined,
  });
}
