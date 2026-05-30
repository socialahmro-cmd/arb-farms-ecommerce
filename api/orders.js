import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    // 1. Get user
    const userResult = await sql`SELECT * FROM users WHERE phone = ${phone}`;
    const user = userResult.rows[0];

    if (!user) {
      return res.status(200).json({ success: true, orders: [] }); // No user = no orders
    }

    // 2. Get orders
    const ordersResult = await sql`SELECT * FROM orders WHERE user_id = ${user.id} ORDER BY created_at DESC`;
    
    // We could fetch items too, but for the dashboard view, order summary is enough
    const orders = ordersResult.rows;

    // Formatting them to match the frontend expectations
    const formattedOrders = orders.map(o => ({
      orderNumber: o.order_number,
      customerName: user.name,
      address: o.address,
      city: o.city,
      total: parseFloat(o.total),
      status: o.status,
      receiptUploaded: !!o.receipt_url,
      orderDate: new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }));

    return res.status(200).json({ success: true, orders: formattedOrders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
