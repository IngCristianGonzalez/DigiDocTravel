import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService, AppLang } from '../../core/i18n/i18n.service';

/**
 * Selector de idioma ES / English (AU) como select nativo, sin banderas.
 * Pensado para pantallas pre-login; también reutilizable en el layout.
 * El idioma inicial es automático según el navegador (ver I18nService).
 */
@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <label class="lang-selector">
      <span class="sr-only">{{ i18n.t('common.language') }}</span>
      <select
        class="lang-selector__select"
        [ngModel]="i18n.lang()"
        (ngModelChange)="setLang($event)"
        [attr.aria-label]="i18n.t('common.language')"
      >
        <option value="es">Español</option>
        <option value="en-AU">English (AU)</option>
      </select>
    </label>
  `,
  styles: [`
    .lang-selector {
      display: inline-flex;
      align-items: center;
    }
    .lang-selector__select {
      font-family: inherit;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--sl-gray-700);
      background: var(--sl-white);
      border: 1px solid var(--sl-gray-300);
      border-radius: 6px;
      padding: 6px 8px;
      cursor: pointer;
      line-height: 1.4;
    }
    .lang-selector__select:hover {
      border-color: var(--sl-gray-400);
    }
    .lang-selector__select:focus-visible {
      outline: 2px solid var(--sl-orange-500);
      outline-offset: 1px;
      border-color: var(--sl-orange-500);
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `],
})
export class LangSelectorComponent {
  readonly i18n = inject(I18nService);

  setLang(lang: AppLang): void {
    this.i18n.setLang(lang);
  }
}
