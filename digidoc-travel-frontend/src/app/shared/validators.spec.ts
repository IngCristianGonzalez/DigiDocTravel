import { FormControl } from '@angular/forms';
import { strongPasswordValidator, noScriptValidator, noSqlInjectionValidator } from './validators';

describe('Validators - OWASP', () => {
  describe('strongPasswordValidator - A07', () => {
    it('should fail weak password', () => {
      expect(strongPasswordValidator(new FormControl('password'))).toEqual({ strongPassword: expect.any(String) });
      expect(strongPasswordValidator(new FormControl('Password123'))).toEqual({ strongPassword: expect.any(String) }); // no special
      expect(strongPasswordValidator(new FormControl('password123!'))).toEqual({ strongPassword: expect.any(String) }); // no upper
    });
    it('should pass strong password', () => {
      expect(strongPasswordValidator(new FormControl('Password123!'))).toBeNull();
      expect(strongPasswordValidator(new FormControl('Aa1@$!%*?&'))).toBeNull();
    });
  });

  describe('noScriptValidator - A03', () => {
    it('should block <script>', () => {
      expect(noScriptValidator(new FormControl('<script>alert(1)</script>'))).toEqual({ xss: expect.any(String) });
      expect(noScriptValidator(new FormControl('javascript:alert(1)'))).toEqual({ xss: expect.any(String) });
    });
    it('should allow normal text', () => {
      expect(noScriptValidator(new FormControl('Juan Perez'))).toBeNull();
    });
  });

  describe('noSqlInjectionValidator - A03', () => {
    it('should block SQL injection', () => {
      expect(noSqlInjectionValidator(new FormControl("'; DROP TABLE users; --"))).toEqual({ injection: expect.any(String) });
      expect(noSqlInjectionValidator(new FormControl("xp_cmdshell"))).toEqual({ injection: expect.any(String) });
    });
    it('should allow normal', () => {
      expect(noSqlInjectionValidator(new FormControl('Colombia'))).toBeNull();
    });
  });
});
