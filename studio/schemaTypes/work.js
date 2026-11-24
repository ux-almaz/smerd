import { defineField, defineType } from "sanity";
import { blocksField } from "./blocks.js";
import { imageField } from "./image.js";

export const work = defineType({
  name: "work",
  title: "Картина",
  type: "document",
  groups: [
    { name: "content", title: "Текст", default: true },
    { name: "sale", title: "Продажа" },
    { name: "place", title: "Публикация" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Адрес",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "series",
      title: "Серия",
      type: "reference",
      to: [{ type: "series" }],
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "season",
      title: "Сезон в слайдере",
      type: "string",
      group: "content",
      description: "Для серии «Чувства времени»: Зима, Весна, Лето, Осень.",
    }),
    defineField({
      name: "kicker",
      title: "Надзаголовок в каталоге",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "subtitle",
      title: "Подзаголовок",
      type: "string",
      group: "content",
      description: "Например, произношение Atharrachadh.",
    }),
    defineField({
      name: "collaborator",
      title: "Соавтор",
      type: "string",
      group: "content",
    }),
    imageField("image", "Изображение", { group: "content" }),
    defineField({
      name: "formatLabel",
      title: "Формат",
      type: "string",
      group: "content",
      description: "Триптих, диптих. Пусто, если работа из одного холста.",
    }),
    defineField({
      name: "medium",
      title: "Техника",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "dimensions",
      title: "Размеры",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "yearLabel",
      title: "Годы",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "figcaption",
      title: "Подпись под изображением",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "pullQuote",
      title: "Крупная фраза",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({
      name: "pullQuotePlacement",
      title: "Где стоит крупная фраза",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Перед текстом", value: "before" },
          { title: "После текста", value: "after" },
        ],
        layout: "radio",
      },
      hidden: ({ parent }) => !parent?.pullQuote,
    }),
    blocksField("body", "Текст", "Абзацы на главной, рядом с работой.", "content"),
    defineField({
      name: "notes",
      title: "Примечания",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    blocksField("story", "История", "Дополнительный текст под работой, как у совместного цикла.", "content"),
    defineField({
      name: "youtubeUrl",
      title: "Ссылка на сюиту",
      type: "url",
      group: "content",
    }),
    defineField({
      name: "youtubeLabel",
      title: "Подпись ссылки",
      type: "string",
      group: "content",
      hidden: ({ parent }) => !parent?.youtubeUrl,
    }),
    defineField({
      name: "availability",
      title: "Продажа",
      type: "string",
      group: "sale",
      initialValue: "forSale",
      options: {
        list: [
          { title: "В корзине, с ценой", value: "forSale" },
          { title: "Цена по запросу", value: "onRequest" },
          { title: "Не продаётся", value: "notForSale" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Цена, ₽",
      type: "number",
      group: "sale",
      hidden: ({ parent }) => parent?.availability !== "forSale",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.availability === "forSale" && !(Number(value) > 0)) return "Укажите цену";
          return true;
        }),
    }),
    defineField({
      name: "priceLabel",
      title: "Подпись вместо цены",
      type: "string",
      group: "sale",
      description: "Например, «Цена по запросу».",
      hidden: ({ parent }) => parent?.availability === "forSale",
    }),
    defineField({
      name: "cartId",
      title: "Ключ корзины",
      type: "string",
      group: "sale",
      description: "Совпадает с ключом в data/works.js. У уже выставленной работы его не переименовывают: сломается корзина и оплата.",
      hidden: ({ parent }) => parent?.availability !== "forSale",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.availability !== "forSale") return true;
          if (!value) return "Нужен ключ корзины";
          if (!/^[a-z0-9-]+$/.test(value)) return "Только латиница, цифры и дефис";
          return true;
        }),
    }),
    defineField({
      name: "cartMeta",
      title: "Короткая подпись в корзине",
      type: "string",
      group: "sale",
      hidden: ({ parent }) => parent?.availability !== "forSale",
    }),
    defineField({
      name: "orderTitle",
      title: "Тема заявки",
      type: "string",
      group: "sale",
      description: "Для кнопки «Заказать», когда цены нет.",
      hidden: ({ parent }) => parent?.availability === "forSale",
    }),
    defineField({
      name: "orderMeta",
      title: "Пояснение в заявке",
      type: "string",
      group: "sale",
      hidden: ({ parent }) => parent?.availability === "forSale",
    }),
    defineField({
      name: "visible",
      title: "Показывать на сайте",
      type: "boolean",
      group: "place",
      initialValue: true,
    }),
    defineField({
      name: "showInCatalog",
      title: "В каталоге",
      type: "boolean",
      group: "place",
      initialValue: true,
    }),
    defineField({
      name: "showInHero",
      title: "Большая работа в шапке главной",
      type: "boolean",
      group: "place",
      initialValue: false,
    }),
    defineField({
      name: "heroCaption",
      title: "Подпись в шапке",
      type: "string",
      group: "place",
      hidden: ({ parent }) => !parent?.showInHero,
    }),
    defineField({
      name: "heroYear",
      title: "Год в шапке",
      type: "string",
      group: "place",
      hidden: ({ parent }) => !parent?.showInHero,
    }),
    defineField({
      name: "sortOrder",
      title: "Порядок внутри серии",
      type: "number",
      group: "place",
      initialValue: 100,
    }),
  ],
  orderings: [
    { title: "Порядок на сайте", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "yearLabel", media: "image" },
  },
});
