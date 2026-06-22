// /api/sync-to-erp.js
// Vercel serverless proxy — forwards Firebase order to ERP MySQL.
// Secret lives here (server-side only), never exposed to the browser.

const ERP_URL    = 'https://erp.ahmroglobal.com/api/sync-to-erp.php';
const ERP_SECRET = 'Jawad@1234';

export default async function handler(req, res) {
  // CORS — allow requests from same origin only
  res.setHeader('Access-Control-Allow-Origin', 'https://arb-farms-ecommerce.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!req.body || !req.body.order) {
    return res.status(400).json({ success: false, message: 'Missing order payload' });
  }

  try {
    const response = await fetch(ERP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ERP_SECRET}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(502).json({
      success: false,
      message: 'ERP server unreachable: ' + err.message,
    });
  }
}
