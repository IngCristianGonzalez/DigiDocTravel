import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `<div style="padding:40px; text-align:center;"><h1>{{ i18n.t('shared.unauthorizedTitle') }}</h1><p>{{ i18n.t('shared.unauthorizedDesc') }}</p><a routerLink="/dashboard">{{ i18n.t('shared.backToDashboard') }}</a></div>`
})
export class UnauthorizedComponent {
  public i18n = inject(I18nService);
}
