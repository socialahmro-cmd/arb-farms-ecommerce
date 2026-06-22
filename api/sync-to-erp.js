// /api/sync-to-erp.js
// Vercel serverless proxy — forwards Firebase order to ERP MySQL.
// Secret lives server-side only, never exposed to the browser.

const ERP_URL    = 'https://erp.ahmroglobal.com/organics/api/sync-to-erp.php';
const ERP_SECRET = 'Jawad@1234';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!req.body || !req.body.order) {
    return res.status(400).json({ success: false, message: 'Missing order payload' });
  }

  let rawText = '';
  try {
    const response = await fetch(ERP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ERP_SECRET}`,
      },
      body: JSON.stringify(req.body),
    });

    rawText = await response.text();

    // Strip any PHP warnings/notices printed before the JSON
    // They look like: "Warning: ...\n" or "Notice: ...\n" or "Deprecated: ...\n"
    const cleaned = rawText
      .replace(/^(\s*(Warning|Notice|Deprecated|Fatal error|Parse error)[^\n]*\n)*/i, '')
      .trim();

    // Find the first { or [ — start of actual JSON
    const jsonStart = cleaned.search(/[{\[]/);
    const jsonStr   = jsonStart >= 0 ? cleaned.slice(jsonStart) : cleaned;

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseErr) {
      // Still not valid JSON — return raw so we can debug
      return res.status(502).json({
        success: false,
        message: 'ERP returned non-JSON response',
        erp_http_status: response.status,
        erp_raw: rawText.substring(0, 1500),
      });
    }

    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(502).json({
      success: false,
      message: 'ERP server unreachable: ' + err.message,
      erp_raw: rawText.substring(0, 500),
    });
  }
}
