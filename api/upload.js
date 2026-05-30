import { handleUpload } from '@vercel/blob/client';

// Vercel Blob Store credentials
// BLOB_STORE_ID: store_LtCbr0XEsLvlYrbO
// Token is read from BLOB_READ_WRITE_TOKEN env var on Vercel;
// the fallback below allows local `vercel dev` without a .env file.
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  process.env.BLOB_READ_WRITE_TOKEN =
    'vercel_blob_rw_LtCbr0XEsLvlYrbO_cegkzgi16UCv7FMs7KcdFk5U2BlRnU';
}

export default async function handler(request, response) {
  try {
    const jsonResponse = await handleUpload({
      body: request.body,
      request: request,
      onBeforeGenerateToken: async (pathname /*, clientPayload */) => {
        // Authorize receipt uploads (images + PDF, max 5 MB)
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
          ],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5 MB
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
            store: 'store_LtCbr0XEsLvlYrbO',
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('[Vercel Blob] Upload completed:', blob.url);
        // Optionally persist blob.url → Firestore here
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('[Vercel Blob] Upload handler error:', error);
    return response.status(400).json({ error: error.message });
  }
}
