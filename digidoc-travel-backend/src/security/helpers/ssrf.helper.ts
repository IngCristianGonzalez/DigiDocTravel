// OWASP A10 - SSRF Prevention: whitelist and validate URLs
const ALLOWED_HOSTS = new Set([
  'digidoc.travel',
  'localhost',
  '127.0.0.1',
  's3.amazonaws.com',
  's3.mock',
  'storage.googleapis.com',
]);

const BLOCKED_IPS = new Set(['169.254.169.254', '0.0.0.0', '127.0.0.1']); // metadata SSRF

export function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (BLOCKED_IPS.has(parsed.hostname)) return false;
    // block private IP ranges 10.x, 192.168.x, 172.16-31
    if (/^10\./.test(parsed.hostname) || /^192\.168\./.test(parsed.hostname) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(parsed.hostname)) return false;
    // For demo, allow s3.mock and localhost, otherwise check whitelist
    if (parsed.hostname.includes('s3.mock') || parsed.hostname === 'localhost') return true;
    return ALLOWED_HOSTS.has(parsed.hostname) || parsed.hostname.endsWith('.amazonaws.com');
  } catch {
    return false;
  }
}

export function validateFileType(mimetype: string, originalname: string): boolean {
  const allowedMime = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const allowedExt = ['pdf', 'jpg', 'jpeg', 'png'];
  const ext = originalname.split('.').pop()?.toLowerCase() || '';
  return allowedMime.includes(mimetype) && allowedExt.includes(ext);
}

// OWASP A10 - Magic bytes validation
export function hasValidMagicBytes(buffer: Buffer, mimetype: string): boolean {
  if (!buffer || buffer.length < 4) return false;
  const header = buffer.subarray(0, 4).toString('hex');
  if (mimetype === 'application/pdf') return header.startsWith('25504446'); // %PDF
  if (mimetype === 'image/png') return header === '89504e47';
  if (mimetype.includes('jpeg') || mimetype === 'image/jpg') return header.startsWith('ffd8ff');
  return true; // fallback
}
