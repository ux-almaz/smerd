const gallery = (S, title, section, template) =>
  S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .filter('_type == "galleryImage" && section == $section')
        .params({ section })
        .defaultOrdering([{ field: "sortOrder", direction: "asc" }])
        .initialValueTemplates([S.initialValueTemplateItem(template)]),
    );

const reviews = (S, title, category) =>
  S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .filter('_type == "review" && category == $category')
        .params({ category })
        .defaultOrdering([{ field: "sortOrder", direction: "asc" }])
        .initialValueTemplates([S.initialValueTemplateItem(`review-${category}`)]),
    );

export const structure = (S) =>
  S.list()
    .title("SMERD.ART")
    .items([
      S.listItem()
        .title("Настройки сайта")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Настройки сайта")),
      S.divider(),
      S.documentTypeListItem("work").title("Картины"),
      S.documentTypeListItem("series").title("Серии"),
      S.divider(),
      gallery(S, "Академический рисунок", "academic", "gallery-academic"),
      gallery(S, "Арт-дневник", "diary", "gallery-diary"),
      gallery(S, "Работы студентов", "student", "gallery-student"),
      S.divider(),
      reviews(S, "Отзывы · детские группы", "kids"),
      reviews(S, "Отзывы · взрослые", "adults"),
      reviews(S, "Отзывы · заказчики", "clients"),
      S.divider(),
      S.documentTypeListItem("cvItem").title("Образование и выставки"),
    ]);
