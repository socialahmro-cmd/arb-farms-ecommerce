import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  try {
    const jsonResponse = await handleUpload({
      body: request.body,
      request: request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authorize uploads for receipts
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString()
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Vercel Blob upload finished:', blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
}
