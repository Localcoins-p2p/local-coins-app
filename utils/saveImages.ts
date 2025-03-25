import { put } from '@vercel/blob';

export default async function saveImages(base64s: string[]) {
  const promises = base64s.map((base64, i) => {
    const base64Image = base64.split(';base64,').pop() as string;
    const binaryData = Buffer.from(base64Image as string, 'base64');
    const contentType = 'image/jpeg';
    const blob: unknown = new Blob([binaryData], { type: contentType });
    return put(`inputs/i-${Date.now()}-${i}.jpg`, blob as File, {
      access: 'public',
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
    });
  });
  const responses = await Promise.all(promises);
  return responses.map((r) => r.url);
}
