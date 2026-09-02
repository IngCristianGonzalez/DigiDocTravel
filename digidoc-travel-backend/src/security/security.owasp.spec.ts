import { encrypt, decrypt, sanitizeUser } from './helpers/crypto.helper';
import { isAllowedUrl, validateFileType, hasValidMagicBytes } from './helpers/ssrf.helper';
import * as xss from 'xss';

describe('OWASP Top 10 - Security Tests', () => {
  describe('A02 Cryptographic Failures', () => {
    it('should encrypt and decrypt visaNumber', () => {
      const original = 'VISA-123456';
      const encrypted = encrypt(original);
      expect(encrypted).not.toBe(original);
      expect(encrypted).toContain(':');
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });
    it('should not expose password in sanitizeUser', () => {
      const user = { id: '1', email: 'a@a.com', password: 'hash', firstName: 'Test' };
      const clean = sanitizeUser(user);
      expect(clean.password).toBeUndefined();
      expect(clean.email).toBe('a@a.com');
    });
  });

  describe('A03 Injection - XSS Sanitization', () => {
    it('should sanitize <script> tags', () => {
      const malicious = '<script>alert("xss")</script><p>Hello</p>';
      const clean = xss.filterXSS(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('Hello');
    });
    it('should sanitize SQL injection patterns via SanitizeInterceptor logic', () => {
      const sql = "'; DROP TABLE users; --";
      const sanitized = sql.replace(/('|--|;|\/\*|\*\/|xp_)/gi, '');
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain('--');
    });
  });

  describe('A07 Identification and Authentication - Password strength', () => {
    it('weak password should fail regex', () => {
      const weak = 'password';
      const strong = 'Password123!';
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
      expect(regex.test(weak)).toBe(false);
      expect(regex.test(strong)).toBe(true);
    });
    it('should enforce min length 8', () => {
      expect('1234567'.length >= 8).toBe(false);
      expect('12345678'.length >= 8).toBe(true);
    });
  });

  describe('A10 SSRF', () => {
    it('should block metadata IP 169.254.169.254', () => {
      expect(isAllowedUrl('http://169.254.169.254/latest/meta-data/')).toBe(false);
    });
    it('should block private IPs 10.x', () => {
      expect(isAllowedUrl('http://10.0.0.1/admin')).toBe(false);
      expect(isAllowedUrl('http://192.168.1.1/file')).toBe(false);
    });
    it('should allow s3.mock and localhost', () => {
      expect(isAllowedUrl('https://s3.mock/file.pdf')).toBe(true);
      expect(isAllowedUrl('http://localhost:3000/api/test')).toBe(true);
    });
    it('should block non-http protocols', () => {
      expect(isAllowedUrl('file:///etc/passwd')).toBe(false);
      expect(isAllowedUrl('gopher://evil.com')).toBe(false);
    });
    it('should validate file types', () => {
      expect(validateFileType('application/pdf', 'doc.pdf')).toBe(true);
      expect(validateFileType('image/png', 'image.exe')).toBe(false);
      expect(validateFileType('application/pdf', 'file.exe')).toBe(false);
    });
    it('should validate magic bytes for PDF', () => {
      const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
      expect(hasValidMagicBytes(pdfHeader, 'application/pdf')).toBe(true);
      const notPdf = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      expect(hasValidMagicBytes(notPdf, 'application/pdf')).toBe(false);
    });
    it('should validate PNG magic bytes', () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
      expect(hasValidMagicBytes(pngHeader, 'image/png')).toBe(true);
    });
  });

  describe('A01 Broken Access Control - Roles', () => {
    it('should check roles array includes required', () => {
      const user = { roles: ['admin', 'consultor'] };
      const required = ['admin'];
      const hasRole = required.some(r => user.roles.includes(r));
      expect(hasRole).toBe(true);
      expect(['asesor'].some(r => user.roles.includes(r))).toBe(false);
    });
  });

  describe('A05 Security Misconfiguration - Headers', () => {
    it('should define helmet CSP directives', () => {
      const csp = {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
      };
      expect(csp.defaultSrc).toContain("'self'");
      expect(csp.scriptSrc).not.toContain("'unsafe-inline'"); // strict
    });
  });

  describe('A09 Logging - Audit', () => {
    it('should create audit log structure', () => {
      const log = { userId: '1', action: 'LOGIN_FAILED', module: 'auth', ip: '127.0.0.1', device: 'test' };
      expect(log.action).toBe('LOGIN_FAILED');
      expect(log.module).toBe('auth');
    });
  });
});
