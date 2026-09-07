import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, AppLang } from '../../core/i18n/i18n.service';

/**
 * Selector de idioma ES / English (AU).
 * Pensado para pantallas pre-login; también reutilizable en el layout.
 * El idioma inicial es automático según el navegador (ver I18nService).
 */
@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-selector" role="group" [attr.aria-label]="i18n.t('common.language')">
      <button
        type="button"
        class="lang-selector__btn"
        [class.lang-selector__btn--active]="i18n.lang() === 'es'"
        (click)="i18n.setLang('es')"
        aria-label="Español"
      >
        <span aria-hidden="true">🇪🇸</span> ES
      </button>
      <button
        type="button"
        class="lang-selector__btn"
        [class.lang-selector__btn--active]="i18n.lang() === 'en-AU'"
        (click)="i18n.setLang('en-AU')"
        aria-label="English (Australia)"
      >
        <span aria-hidden="true">🇦🇺</span> EN-AU
      </button>
    </div>
  `,
  styles: [`
    .lang-selector {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--sl-gray-100);
      border: 1px solid var(--sl-gray-200);
      border-radius: 9999px;
      padding: 3px;
    }
    .lang-selector__btn {
      border: none;
      background: transparent;
      border-radius: 9999px;
      padding: 4px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--sl-gray-600);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      line-height: 1.4;
    }
    .lang-selector__btn:hover {
      background: var(--sl-gray-200);
      color: var(--sl-black);
    }
    .lang-selector__btn--active {
      background: var(--sl-white);
      color: var(--sl-black);
      box-shadow: var(--shadow-xs);
    }
  `],
})
export class LangSelectorComponent {
  readonly i18n = inject(I18nService);

  setLang(lang: AppLang): void {
    this.i18n.setLang(lang);
  }
}
