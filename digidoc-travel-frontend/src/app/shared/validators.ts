import { AbstractControl, ValidationErrors } from '@angular/forms';

// OWASP A07 - Strong password validation
export function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[@$!%*?&]/.test(value);
  const valid = hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8;
  return valid ? null : { strongPassword: 'Debe contener mayúscula, minúscula, número y carácter especial, mínimo 8 caracteres' };
}

export function noScriptValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  if (/<script|javascript:|onerror|onload/i.test(value)) {
    return { xss: 'Contenido potencialmente peligroso detectado' };
  }
  return null;
}

export function noSqlInjectionValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  if (/('|--|;|\/\*|\*\/|xp_)/i.test(value)) {
    return { injection: 'Caracteres no permitidos' };
  }
  return null;
}
