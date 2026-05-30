import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // Vercel handles multipart form data natively if configured correctly,
    // but for simplicity, we assume the frontend sends the filename and base64 body
    // OR we can just use the straightforward @vercel/blob upload approach.
    // For this example, we expect the client to send standard body data or we parse it.
    
    // Quick tip: Since this is standard Edge/Serverless, standard parsing is needed.
    // To keep it clean and robust without external libraries like 'formidable', 
    // the frontend can send a base64 string or the client can upload directly using `@vercel/blob` client SDK.

    // Let's assume the frontend sends a JSON with { orderNumber, fileData, fileName }
    const { orderNumber, fileData, fileName } = req.body;

    if (!orderNumber || !fileData) {
      return res.status(400).json({ error: 'Order Number and File Data required' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData.split(',')[1], 'base64');

    // Upload to Vercel Blob
    const blob = await put(`receipts/${orderNumber}-${fileName}`, buffer, {
      access: 'public',
    });

    // Update the database order with the receipt URL
    await sql`
      UPDATE orders 
      SET receipt_url = ${blob.url}, status = 'Advance Paid - Processing'
      WHERE order_number = ${orderNumber}
    `;

    return res.status(200).json({ success: true, url: blob.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
