// Placeholder storage helper. For dev, we simply echo back a fake URL.
// In production, replace with AWS S3 SDK calls using config.s3.

export type StoredObject = { key: string; url: string };

export async function storeFile(_buffer: Buffer, filename: string): Promise<StoredObject> {
  // TODO: implement real S3 upload
  const key = `dev/${Date.now()}-${filename}`;
  const url = `https://example.com/${key}`;
  return { key, url };
}

export async function deleteFile(_key: string): Promise<void> {
  // TODO: implement real delete
  return;
}
