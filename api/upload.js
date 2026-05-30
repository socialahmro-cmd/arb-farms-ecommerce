import { put } from '@vercel/blob';

// Token is passed directly to put() — no env-var timing issues, no client handshake
const BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN ||
  'vercel_blob_rw_LtCbr0XEsLvlYrbO_cegkzgi16UCv7FMs7KcdFk5U2BlRnU';

// Disable body parser so we can stream the raw binary directly to Vercel Blob
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const filename    = req.query.filename || `receipts/receipt-${Date.now()}`;
  const contentType = req.headers['content-type'] || 'application/octet-stream';

  try {
    // Collect raw binary body from the request stream
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Empty file received' });
    }

    // Upload directly to Vercel Blob using the server-side token
    const blob = await put(filename, buffer, {
      access: 'public',
      token: BLOB_TOKEN,
      contentType,
      addRandomSuffix: false,
    });

    console.log('[Vercel Blob] Uploaded:', blob.url);
    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('[Vercel Blob] put() error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
