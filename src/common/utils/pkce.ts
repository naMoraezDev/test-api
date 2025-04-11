export function base64UrlEncode(buffer: Buffer | Uint8Array): string {
  const bufferObj = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  return bufferObj
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
