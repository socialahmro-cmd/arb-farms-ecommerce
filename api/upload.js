import { handleUpload } from '@vercel/blob/client';

// BLOB_STORE_ID: store_LtCbr0XEsLvlYrbO
const BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN ||
  'vercel_blob_rw_LtCbr0XEsLvlYrbO_cegkzgi16UCv7FMs7KcdFk5U2BlRnU';

export default async function handler(request, response) {
  try {
    const jsonResponse = await handleUpload({
      body: request.body,
      request: request,
      token: BLOB_TOKEN,          // ← pass token explicitly; avoids env-var timing issues
      onBeforeGenerateToken: async (pathname) => {
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
      onUploadCompleted: async ({ blob }) => {
        console.log('[Vercel Blob] Upload completed:', blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('[Vercel Blob] Upload handler error:', error.message);
    return response.status(400).json({ error: error.message });
  }
}
