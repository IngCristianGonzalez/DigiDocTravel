import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LangSelectorComponent } from '../../../shared/components/lang-selector.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, ButtonModule, LangSelectorComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  public i18n = inject(I18nService);

  mobileMenuOpen = false;
}
