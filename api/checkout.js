const crypto = require("crypto");
const { WORKS, loadConfig, originFrom, paymentUrl } = require("./robokassa");

const LIMITS = { name: 80, phone: 40, contact: 80, comment: 240 };

function clip(value, max) {
  return String(value || "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, max);
}

async function readJson(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8") || "{}");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function send(res, code, payload) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

module.exports = async function checkout(req, res) {
  if (req.method !== "POST") {
    send(res, 405, { error: "Метод не поддерживается." });
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    send(res, 400, { error: "Не удалось прочитать заказ." });
    return;
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const unique = [...new Set(items)];
  const works = unique.map((id) => WORKS[id]);
  if (!unique.length || unique.length > 5 || unique.length !== items.length || works.some((work) => !work)) {
    send(res, 400, { error: "В заказе есть неизвестная работа. Обновите страницу и соберите корзину заново." });
    return;
  }

  const customer = {
    name: clip(body.name, LIMITS.name),
    phone: clip(body.phone, LIMITS.phone),
    contact: clip(body.contact, LIMITS.contact),
    comment: clip(body.comment, LIMITS.comment),
  };
  const digits = customer.phone.replace(/\D/g, "");
  if (customer.name.length < 2 || digits.length < 10 || customer.contact.length < 3) {
    send(res, 400, { error: "Укажите имя, телефон и Telegram или e-mail." });
    return;
  }
  if (body.consent !== true) {
    send(res, 400, { error: "Чтобы перейти к оплате, примите оферту и дайте согласие на обработку персональных данных." });
    return;
  }
  customer.consent = true;
  if (customer.contact.includes("@") && !customer.contact.includes(" ")) customer.email = customer.contact;

  const config = loadConfig();
  if (!config.login || !config.password1) {
    send(res, 503, {
      error: "Оплата ещё не подключена: в настройках сайта нет магазина Robokassa.",
    });
    return;
  }

  const url = paymentUrl({
    works,
    customer,
    invId: crypto.randomInt(1, 2147483647),
    config,
    origin: originFrom(req),
  });

  send(res, 200, { url });
};
