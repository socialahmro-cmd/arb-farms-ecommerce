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

  let { phone, address, city, paymentMethod, subtotal, shipping, total, items, customerName } = req.body;

  // Security: Input Sanitization
  phone = sanitize(phone);
  address = sanitize(address);
  city = sanitize(city);
  customerName = sanitize(customerName);
  paymentMethod = sanitize(paymentMethod);

  // Security: Basic Validation
  if (!phone || !address || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get or create user
    let userResult = await sql`SELECT * FROM users WHERE phone = ${phone}`;
    let user = userResult.rows[0];

    if (!user) {
      const insertUser = await sql`
        INSERT INTO users (phone, pin, name) 
        VALUES (${phone}, '0000', ${customerName || 'Customer'}) 
        RETURNING *;
      `;
      user = insertUser.rows[0];
    }

    // 2. Create Order
    const orderNumber = "ARB-" + Math.floor(100000 + Math.random() * 900000);
    const orderResult = await sql`
      INSERT INTO orders (user_id, order_number, address, city, payment_method, subtotal, shipping, total)
      VALUES (${user.id}, ${orderNumber}, ${address}, ${city}, ${paymentMethod}, ${subtotal}, ${shipping}, ${total})
      RETURNING *;
    `;
    const order = orderResult.rows[0];

    // 3. Insert Items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, price, qty)
        VALUES (${order.id}, ${item.id}, ${item.name}, ${item.price}, ${item.qty})
      `;
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
