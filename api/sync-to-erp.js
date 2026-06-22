// /api/sync-to-erp.js  (Pages Router — works on free Vercel plan)

const ERP_URL    = 'https://erp.ahmroglobal.com/api/sync-to-erp.php';
const ERP_SECRET = 'Jawad@1234';   // move to Vercel env var: process.env.ERP_SYNC_SECRET

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const response = await fetch(ERP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ERP_SECRET}`,
      },
      body: JSON.stringify(req.body),   // forward the order payload as-is
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(502).json({ success: false, message: 'ERP unreachable: ' + err.message });
  }
}
