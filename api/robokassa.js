const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { WORKS } = require("../data/works");

function loadConfig() {
  const config = {
    login: process.env.ROBOKASSA_LOGIN || "",
    password1: process.env.ROBOKASSA_PASSWORD1 || "",
    password2: process.env.ROBOKASSA_PASSWORD2 || "",
    test: process.env.ROBOKASSA_TEST === "1",
    hash: (process.env.ROBOKASSA_HASH || "md5").toLowerCase(),
  };

  const file = path.join(__dirname, "robokassa.local.json");
  if (fs.existsSync(file)) {
    const local = JSON.parse(fs.readFileSync(file, "utf8"));
    if (local.login) config.login = String(local.login);
    if (local.password1) config.password1 = String(local.password1);
    if (local.password2) config.password2 = String(local.password2);
    if (local.hash) config.hash = String(local.hash).toLowerCase();
    if (typeof local.test === "boolean") config.test = local.test;
  }

  const allowed = new Set(["md5", "sha256", "sha512"]);
  if (!allowed.has(config.hash)) config.hash = "md5";

  return config;
}

function sign(parts, algo) {
  return crypto.createHash(algo).update(parts.join(":"), "utf8").digest("hex");
}

function shpPairs(fields) {
  return Object.keys(fields)
    .filter((key) => key.startsWith("Shp_") && fields[key] !== undefined && fields[key] !== "")
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${fields[key]}`);
}

function money(sum) {
  return (Math.round(sum * 100) / 100).toFixed(2);
}

function originFrom(req) {
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = forwarded
    ? String(forwarded).split(",")[0].trim()
    : req.socket?.encrypted
      ? "https"
      : "http";
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return host ? `${proto}://${host}` : "";
}

function paymentUrl({ works, customer, invId, config, origin }) {
  const outSum = money(works.reduce((sum, work) => sum + work.price, 0));
  const shp = {
    Shp_name: customer.name,
    Shp_phone: customer.phone,
    Shp_contact: customer.contact,
  };
  if (customer.comment) shp.Shp_comment = customer.comment;
  if (customer.consent) shp.Shp_consent = "1";

  const signature = sign(
    [config.login, outSum, String(invId), config.password1, ...shpPairs(shp)],
    config.hash
  );

  const description = `Оригиналы: ${works.map((work) => work.title).join(", ")}`.slice(0, 100);
  const params = new URLSearchParams({
    MerchantLogin: config.login,
    OutSum: outSum,
    InvId: String(invId),
    Description: description,
    SignatureValue: signature,
    Culture: "ru",
    Encoding: "utf-8",
  });

  if (config.test) params.set("IsTest", "1");
  if (customer.email) params.set("Email", customer.email);
  if (origin) {
    params.set("SuccessURL", `${origin}/payment.html?result=success`);
    params.set("FailURL", `${origin}/payment.html?result=fail`);
  }
  Object.entries(shp).forEach(([key, value]) => params.set(key, value));

  return `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;
}

function resultIsValid(fields, config) {
  const signature = String(fields.SignatureValue || fields.signaturevalue || "");
  const outSum = fields.OutSum || fields.out_summ || "";
  const invId = fields.InvId || fields.inv_id || "";
  if (!signature || !outSum || !invId || !config.password2) return false;

  const expected = sign([outSum, invId, config.password2, ...shpPairs(fields)], config.hash);
  const left = Buffer.from(signature.toLowerCase());
  const right = Buffer.from(expected.toLowerCase());
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = {
  WORKS,
  loadConfig,
  money,
  originFrom,
  paymentUrl,
  resultIsValid,
};
