/** Запросы для сайта, когда датасет Sanity станет публичным. */
module.exports = {
  site: `*[_id == "siteSettings"][0]{
    artistName, siteName, email, phone, legalLine, copyright,
    socials[]{label, url},
    seoTitle, seoDescription, heroKicker, heroLead, orderButton, enrollButton,
    paintingYears, paintingLabel, paintingText, drawingYears, drawingIntro,
    academicTitle, academicNote, diaryTitle, diaryNote,
    studentsTitle, studentsIntro, studentsNote,
    reviewsKicker, reviewsTitle, footerTitle, footerLead,
    catalogKicker, catalogTitle, catalogLead, catalogFooterTitle, catalogFooterKicker,
    customOrder, portraitCaption, aboutStatement, aboutText, practices[]{title, text},
    cvYears, cvTitle, lessonFormats[]{title, note, url, linkLabel},
    portrait{alt, asset->{url}}
  }`,
  series: `*[_type == "series"] | order(sortOrder asc){
    _id, title, "slug": slug.current, filterKey, layout, kicker, years, subtitle, description
  }`,
  works: `*[_type == "work" && visible != false] | order(sortOrder asc){
    _id, title, "slug": slug.current, season, kicker, subtitle, collaborator,
    formatLabel, medium, dimensions, yearLabel, figcaption,
    pullQuote, pullQuotePlacement, body, notes, story,
    youtubeUrl, youtubeLabel, availability, price, priceLabel,
    cartId, cartMeta, orderTitle, orderMeta,
    showInCatalog, showInHero, heroCaption, heroYear, sortOrder,
    "seriesId": series._ref,
    image{alt, asset->{url}}
  }`,
  cart: `*[_type == "work" && visible != false && availability == "forSale"]{
    "id": cartId, title, "meta": cartMeta, price, "image": image.asset->url
  }`,
  gallery: `*[_type == "galleryImage" && visible != false && section == $section] | order(sortOrder asc){
    title, detail, caption, image{alt, asset->{url}}
  }`,
  reviews: `*[_type == "review" && visible != false] | order(sortOrder asc){
    category, text, author
  }`,
  cv: `*[_type == "cvItem"] | order(sortOrder asc){group, period, text}`,
};
