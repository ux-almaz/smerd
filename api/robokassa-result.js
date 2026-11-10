const { loadConfig, resultIsValid } = require("./robokassa");

async function readFields(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (req.method === "GET") return Object.fromEntries(new URL(req.url, "https://smerd.local").searchParams);
  if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
    return Object.fromEntries(new URLSearchParams(raw));
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString("utf8")));
}

module.exports = async function result(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.statusCode = 405;
    res.end("");
    return;
  }

  const fields = await readFields(req);
  const config = loadConfig();
  const invId = fields.InvId || fields.inv_id || "";

  if (!resultIsValid(fields, config)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("bad sign");
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(`OK${invId}`);
};
