const ORDER_EMAIL = "olga.smerd.art@gmail.com";

const works = [...document.querySelectorAll(".work")];
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const catalogCount = document.querySelector("[data-catalog-count]");

const plural = (n, one, few, many) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

const applyFilter = (filter) => {
  let visible = 0;
  works.forEach((work) => {
    const category = work.dataset.category;
    const show = filter === "all" || category === filter || category === "all";
    work.hidden = !show;
    if (show && category !== "all") visible += 1;
  });
  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
  });
  catalogCount.textContent = `${visible} ${plural(visible, "работа", "работы", "работ")}`;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyFilter(button.dataset.filter));
});

applyFilter("all");

const dialog = document.querySelector("[data-order-dialog]");
const form = dialog.querySelector("[data-order-form]");
const dialogTitle = dialog.querySelector("[data-order-title]");
const dialogMeta = dialog.querySelector("[data-order-meta]");
const status = dialog.querySelector("[data-order-status]");
const defaultStatus = status.textContent;
let selected = { title: "", meta: "" };

document.querySelectorAll("[data-order]").forEach((button) => {
  button.addEventListener("click", () => {
    selected = { title: button.dataset.order, meta: button.dataset.orderMeta ?? "" };
    dialogTitle.textContent = selected.title;
    dialogMeta.textContent = selected.meta;
    status.textContent = defaultStatus;
    dialog.showModal();
    form.elements.name.focus();
  });
});

dialog.querySelector("[data-order-close]").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const { name, contact, message } = form.elements;
  const sentAt = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  const subject = `Заказ: «${selected.title}»`;
  const body = [
    "Здравствуйте, Ольга!",
    "",
    `Хочу заказать: «${selected.title}»`,
    selected.meta,
    "",
    `Имя: ${name.value.trim()}`,
    `Контакт: ${contact.value.trim()}`,
    `Дата отправки: ${sentAt} (МСК)`,
    "Согласие на обработку персональных данных: да",
    message.value.trim() ? `\nКомментарий:\n${message.value.trim()}` : "",
  ]
    .filter((line, i, lines) => line !== "" || lines[i - 1] !== "")
    .join("\n");

  window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = `Письмо подготовлено — отправьте его в почтовой программе. Если она не открылась, напишите на ${ORDER_EMAIL}.`;
});
