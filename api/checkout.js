import { sql } from '@vercel/postgres';
import { db } from "../../js/firebase-init.js";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Security Helper
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g,
    tag => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[tag] || tag)
  );
};

// SKU map: Firebase product id → ERP sku
const SKU_MAP = {
  "ogn-004-milk":"OGN-001","ogn-005":"OGN-002","ogn-006":"OGN-003",
  "ogn-007":"OGN-007","ogn-008":"OGN-008","ogn-009":"OGN-009","ogn-010":"OGN-010",
  "ogn-011":"OGN-011","ogn-012":"OGN-012","ogn-013":"OGN-013","ogn-014":"OGN-014",
  "ogn-015":"OGN-017","ogn-016":"OGN-018","ogn-017":"OGN-019",
  "ogn-066-white-chaunsa-5kg":"OGN-073","ogn-066-white-chaunsa-9kg":"OGN-074",
  "ogn-067-sindhri-5kg":"OGN-075","ogn-067-sindhri-9kg":"OGN-076",
  "ogn-068-dusehri-5kg":"OGN-069","ogn-068-dusehri-9kg":"OGN-070",
  "ogn-069-anwar-ratol-5kg":"OGN-071","ogn-069-anwar-ratol-9kg":"OGN-072",
  "ogn-018":"OGN-045","ogn-018-5kg":"OGN-083","ogn-018-40kg":"OGN-084",
  "ogn-027-edible":"OGN-047","ogn-046":"OGN-048",
  "ogn-028-edible":"OGN-049","ogn-048":"OGN-050",
  "ogn-063":"OGN-065","ogn-064":"OGN-066",
  "ogn-053-moringa":"OGN-055","ogn-054":"OGN-056",
  "ogn-055":"OGN-057","ogn-056":"OGN-058",
  "ogn-057":"OGN-059","ogn-058":"OGN-060",
  "ogn-059":"OGN-061","ogn-060":"OGN-062",
  "ogn-051":"OGN-051","ogn-061-edible":"OGN-052",
  "ogn-052":"OGN-053","ogn-053-pumpkin":"OGN-054",
  "ogn-041":"OGN-043","ogn-042":"OGN-044","ogn-044":"OGN-046",
  "ogn-019":"OGN-021","ogn-020":"OGN-022","ogn-021":"OGN-023","ogn-022":"OGN-024",
  "ogn-023":"OGN-025","ogn-024":"OGN-026","ogn-025":"OGN-027","ogn-026":"OGN-028",
  "ogn-027-seed":"OGN-029","ogn-028-seed":"OGN-030","ogn-029-seed":"OGN-031",
  "ogn-030":"OGN-032","ogn-031":"OGN-033","ogn-032":"OGN-034","ogn-033":"OGN-035",
  "ogn-034":"OGN-036","ogn-035":"OGN-037","ogn-036":"OGN-038","ogn-037":"OGN-039",
  "ogn-038":"OGN-040","ogn-039":"OGN-041","ogn-040":"OGN-042",
  "ogn-061":"OGN-063","ogn-062":"OGN-064","ogn-004-seed":"OGN-085",
};

function enrichItemsWithSku(items = []) {
  return items.map(item => ({ ...item, sku: SKU_MAP[item.id] ?? null }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  let { phone, address, city, state = "", paymentMethod, subtotal, shipping, total, items = [], customerName, email = null, receiptUrl = null, notes = "" } = req.body;

  // Sanitize
  phone         = sanitize(phone);
  address       = sanitize(address);
  city          = sanitize(city);
  customerName  = sanitize(customerName);
  paymentMethod = sanitize(paymentMethod);

  // Validate
  if (!phone || !address || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get or create user in Postgres
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

    // 2. Generate order number
    const orderNumber = "ARB-" + Math.floor(100000 + Math.random() * 900000);

    // 3. Insert into Postgres orders table
    const orderResult = await sql`
      INSERT INTO orders (user_id, order_number, address, city, payment_method, subtotal, shipping, total)
      VALUES (${user.id}, ${orderNumber}, ${address}, ${city}, ${paymentMethod}, ${subtotal}, ${shipping}, ${total})
      RETURNING *;
    `;
    const order = orderResult.rows[0];

    // 4. Insert items into Postgres order_items table
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, price, qty)
        VALUES (${order.id}, ${item.id}, ${item.name}, ${item.price}, ${item.qty})
      `;
    }

    // 5. Enrich items with ERP SKU and save to Firebase
    const enrichedItems = enrichItemsWithSku(items);

    const unmappedItems = enrichedItems.filter(i => !i.sku);
    if (unmappedItems.length) {
      console.warn(`[Order ${orderNumber}] Items missing ERP SKU:`,
        unmappedItems.map(i => `${i.name} (id: ${i.id})`)
      );
    }

    const orderData = {
      orderNumber,
      customerName: customerName || "Customer",
      phone,
      email,
      address: address || "",
      city,
      state,
      country: "Pakistan",
      paymentMethod: paymentMethod || "bank",
      items: enrichedItems,
      subtotal: subtotal || 0,
      shippingRate: shipping || 0,
      total: total || 0,
      receiptUrl,
      notes,
      status: "Awaiting Verification",
      orderDate: new Date().toISOString(),
      erp_synced: false,
      erp_order_id: null,
      erp_synced_at: null,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(collection(db, "orders"), orderNumber), orderData);

    return res.status(200).json({ success: true, order, orderNumber });

  } catch (error) {
    console.error("[create-order] Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
