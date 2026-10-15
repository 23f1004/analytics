const API_KEY = "ak_9gu8qsvph9qripo9bfheh77v";
const EMAIL = "your-email@example.com"; // <-- CHANGE THIS

module.exports = (req, res) => {
  // CORS: lets the exam page (a different website) call your API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  // Browsers send a "preflight" OPTIONS request first. Just say OK.
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  // Bouncer: check the API key
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Read the body (Vercel usually parses JSON for us; this is a safety net)
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const events = (body && Array.isArray(body.events)) ? body.events : [];

  // Calculator
  const users = new Set();
  const positiveTotals = {}; // e.g. { alice: 80.5, bob: 12 }
  let revenue = 0;

  for (const e of events) {
    users.add(e.user);
    if (e.amount > 0) {
      revenue += e.amount;
      positiveTotals[e.user] = (positiveTotals[e.user] || 0) + e.amount;
    }
  }

  let topUser = null;
  let best = -Infinity;
  for (const [user, total] of Object.entries(positiveTotals)) {
    if (total > best) {
      best = total;
      topUser = user;
    }
  }

  return res.status(200).json({
    email: EMAIL,
    total_events: events.length,
    unique_users: users.size,
    revenue: revenue,
    top_user: topUser,
  });
};