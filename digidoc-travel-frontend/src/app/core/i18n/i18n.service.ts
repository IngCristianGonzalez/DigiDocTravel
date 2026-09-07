import { Injectable, computed, signal } from '@angular/core';
import { ES } from './lang-es';
import { EN_AU } from './lang-en-au';

export type AppLang = 'es' | 'en-AU';

const STORE_KEY = 'digidoc-lang';

const DICTS: Record<AppLang, Record<string, string>> = {
  es: ES,
  'en-AU': EN_AU,
};

/**
 * Servicio i18n liviano (sin dependencias externas).
 * - Idiomas: español (por defecto) e inglés australiano (en-AU).
 * - Autodetección: idioma guardado > idioma del navegador > 'es'.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<AppLang>('es');
  readonly dict = computed(() => DICTS[this.lang()]);

  constructor() {
    this.init();
  }

  /** Autodetección: localStorage > navigator.language > 'es'. */
  init(): void {
    try {
      const stored = (localStorage.getItem(STORE_KEY) || '').trim();
      if (stored === 'es' || stored === 'en-AU') {
        this.lang.set(stored);
        return;
      }
    } catch {
      // almacenamiento no disponible: seguir con navegador
    }
    const nav = this.browserLang();
    this.lang.set(nav);
  }

  private browserLang(): AppLang {
    try {
      const tags: string[] = [];
      const nav = navigator as Navigator & { languages?: string[] };
      if (Array.isArray(nav.languages)) tags.push(...nav.languages);
      if (nav.language) tags.push(nav.language);
      for (const t of tags) {
        const low = (t || '').toLowerCase();
        if (!low) continue;
        if (low.startsWith('en')) return 'en-AU';
        if (low.startsWith('es')) return 'es';
      }
    } catch {
      // sin acceso a navigator: valor por defecto
    }
    return 'es';
  }

  setLang(next: AppLang): void {
    this.lang.set(next);
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch {
      // almacenamiento no disponible: solo memoria
    }
  }

  /** Traduce una clave. Si falta, devuelve la clave (fallback visible). Soporta {var}. */
  t(key: string, params?: Record<string, string | number | null | undefined>): string {
    const hit = this.dict()[key];
    let out = hit ?? DICTS['es'][key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        out = out.replaceAll(`{${k}}`, String(v ?? ''));
      }
    }
    return out;
  }
}
