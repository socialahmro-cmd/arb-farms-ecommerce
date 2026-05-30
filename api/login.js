import { sql } from '@vercel/postgres';

// Security Helper: Escape basic HTML to prevent XSS
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  let { phone, pin, name } = req.body;

  // Security: Input Sanitization
  phone = sanitize(phone);
  pin = sanitize(pin);
  name = sanitize(name);

  // Security: Basic Validation
  if (!phone || !pin || pin.length < 4 || phone.length < 10) {
    return res.status(400).json({ error: 'Valid Phone and PIN are required' });
  }

  try {
    // Check if user exists
    const userResult = await sql`SELECT * FROM users WHERE phone = ${phone}`;
    let user = userResult.rows[0];

    if (user) {
      // Very basic plain text pin check (for demo purposes)
      if (user.pin !== pin) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }
    } else {
      // If user does not exist, create them (auto-register on first login)
      const insertResult = await sql`
        INSERT INTO users (phone, pin, name) 
        VALUES (${phone}, ${pin}, ${name || 'Customer'}) 
        RETURNING *;
      `;
      user = insertResult.rows[0];
    }

    return res.status(200).json({ success: true, user: { id: user.id, phone: user.phone, name: user.name } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
