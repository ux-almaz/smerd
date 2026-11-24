import { defineField } from "sanity";

const block = {
  type: "block",
  styles: [
    { title: "Абзац", value: "normal" },
    { title: "Цитата", value: "blockquote" },
  ],
  lists: [],
  marks: {
    decorators: [
      { title: "Полужирный", value: "strong" },
      { title: "Курсив", value: "em" },
    ],
    annotations: [],
  },
};

export function blocksField(name, title, description, group) {
  return defineField({
    name,
    title,
    description,
    group,
    type: "array",
    of: [block],
  });
}
