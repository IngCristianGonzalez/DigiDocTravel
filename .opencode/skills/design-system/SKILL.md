---
name: design-system
version: 1.2.0
description: Design system specification, tokens, mixins, and component patterns for HSK UI.
tags: [ui, design, angular, css, tokens]
owner: equipo-frontend
dependencies: []
license: MIT
---

# HSK Design System Skill

You are a **design system architect** for the HSK ebrisk-front project. When invoked, you generate UI code that is 100% consistent with the established design system.

## Context

### Tech Stack
- Angular 20 (standalone components, signal-based)
- PrimeNG 20.4 (Aura theme) — **ONLY for functional components**
- SCSS with CSS custom properties
- Design tokens defined in `src/styles/`

### File Structure

```
src/styles/
  _tokens.scss           ← CSS custom properties (:root)
  _mixins.scss           ← Reusable SCSS patterns
  _utilities.scss        ← Global CSS utility classes
  _primeng-overrides.scss ← PrimeNG theme customization
  _animations.scss       ← Keyframes
  _skeleton.scss         ← Skeleton loading

src/app/shared/components/
  primary-button/        ← HskButton (multi-variant)
  modal/                 ← HskModal (sm/md/lg)
  page-shell/            ← PageShell (sidebar + surface layout)
  card/                  ← Card wrapper
  badge/                 ← (DEPRECATED) Use p-tag
  table/                 ← (DEPRECATED) Use p-table
  select/                ← (DEPRECATED) Use p-select
  multi-select/          ← (DEPRECATED) Use p-multiselect
  dashboard-navbar/      ← Top navbar
  dashboard-sidebar/     ← Collapsible sidebar
```

## Design Tokens Reference

### Colors
| Token | Value | Use |
|-------|-------|-----|
| `--hsk-primary` | `#143B5E` | Primary brand navy |
| `--hsk-brand-deep` | `#292a71` | Deep blue accents |
| `--hsk-accent` | `#ecc236` | Yellow accent |
| `--color-bg-card` | `#ffffff` | Card/surface bg |
| `--color-bg-dashboard` | `#e4f1fa` | Dashboard page bg |
| `--color-bg-container` | `#f3f5f8` | Section container bg |
| `--color-bg-surface` | `#f4f4f4` | Subtle info bg |
| `--color-bg-highlight` | `#e9e9ff` | Light brand tint |
| `--color-text-primary` | `#030616` | Body text |
| `--color-text-heading` | `var(--hsk-primary)` | Headings |
| `--color-text-secondary` | `#45556c` | Subtitles |
| `--color-text-muted` | `#64748b` | Placeholders |
| `--color-border` | `#e3e8ef` | Default borders |

### Spacing
| Token | Value |
|-------|-------|
| `--space-xxs` | `4px` |
| `--space-xs` | `8px` |
| `--space-sm` | `12px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `32px` |
| `--space-2xl` | `48px` |

### Border Radius
| Token | Value |
|-------|-------|
| `--radius-xs` | `4px` |
| `--radius-sm` | `6px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-xl` | `16px` |
| `--radius-full` | `9999px` |

### Shadows (Elevation)
| Token | Value | Use |
|-------|-------|-----|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Cards at rest |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.06)` | Hover, small cards |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.1)` | Elevated cards |
| `--shadow-lg` | `0 10px 25px rgba(0,0,0,0.1)` | Modals, drawers |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), ...` | Major overlays |
| `--shadow-focus` | `0 0 0 3px rgba(20,59,94,0.15)` | Focus rings |

### Transitions
| Token | Value |
|-------|-------|
| `--transition-fast` | `0.15s ease` |
| `--transition-base` | `0.2s ease` |
| `--transition-slow` | `0.3s cubic-bezier(0.4, 0, 0.2, 1)` |

## Rules

### Layout Rules
1. **Floating bubble containers** — Use `--color-bg-card` + `--radius-xl` + `--color-border` for main content cards.
2. **CSS Grid only** — No PrimeNG layout. Use CSS Grid for dashboards, Flexbox for inline flows.
3. **Responsive breakpoints**: 767px (mobile), 1023px (tablet).
4. **Dashboard background**: `var(--color-bg-dashboard)` — never hardcode `#e4f1fa`.
5. **Section containers**: `var(--color-bg-container)` — never hardcode `#f3f5f8`.

### Component Rules
1. **Buttons** — Always use `app-primary-button` (now HskButton) with `variant` input:
   - `primary`: main CTAs (navy `#143B5E`)
   - `secondary`: cancel, back (white + border)
   - `ghost`: subtle actions (transparent, deep blue text)
   - `danger`: delete, destructive (red)
   - `outline`: alternative CTAs (transparent + navy border)
2. **Modals** — Always use `app-modal` component:
   - Sizes: `sm` (480px), `md` (600px), `lg` (900px)
   - Footer buttons: always 50/50 width split (built-in via `flex: 1`)
   - Overlay: `var(--modal-overlay-bg)` — never hardcode rgba
3. **Page layouts** — Use `app-page-shell` for create/edit pages with sidebar TOC.

### PrimeNG Rules
**ALLOWED:**
`p-table` + `TableModule`, `p-select`, `p-multiselect`, `p-inputtext`, `p-floatlabel`, `p-tag`, `p-skeleton`, `p-avatar`, `p-toast`, `p-progressbar`, `p-checkbox`, `p-datepicker`, `p-autocomplete`, `p-popover`, `p-confirmDialog`, `pi-*` icons

**p-button**: ONLY as icon action buttons inside table rows (`[text]="true" [rounded]="true"`). Use `app-primary-button` for all standalone CTAs.

**FORBIDDEN** (use HSK components instead):
`p-card`, `p-dialog`, `p-sidebar`, `p-toolbar`, `p-panel`, `p-tabview`, `p-divider`

> **`app-table` is DEPRECATED** — Use `p-table` (PrimeNG TableModule) for all new tables. See patterns below.

> **p-button override**: `_primeng-overrides.scss` forces the default primary variant to `--btn-primary-surface` (navy). Outlined variant uses `--hsk-primary` outline + hover tint.

### Code Style Rules
1. **Never hardcode** color hex values — use CSS custom properties.
2. **Never hardcode** `border-radius`, `box-shadow`, `font-family` — use tokens.
3. **Never use `!important`** unless overriding PrimeNG internals.
4. **Hover pattern**: `transform: translateY(-1px); box-shadow: var(--shadow-sm);`
5. **Active pattern**: `transform: translateY(0); box-shadow: var(--shadow-xs);`
6. Use `var(--hsk-font-family)` if font-family is needed. Never write `'Inter'` directly.

## Page Layout Patterns

### Surface Wrapper (`.page-surface`)
All page content must be wrapped in a `.page-surface` container — a white card that groups all content (tabs, filters, tables, dashboards).

```scss
.page-surface {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: var(--space-lg);
  overflow: hidden;
}
```

For detail pages (scrollable content), add `overflow-y: auto` instead of `overflow: hidden`.

### Glider Tabs (custom — replaces PrimeNG p-tabView)
**ALWAYS** use custom glider tabs. **NEVER** use PrimeNG `p-tabView`.

**HTML pattern:**
```html
<div class="tabs-control-wrapper">
  <div class="tabs-container" #tabsContainer>
    <div class="tab-glider"
         [style.left]="gliderStyle().left"
         [style.width]="gliderStyle().width"></div>
    @for (tab of viewTabs; track tab.value) {
      <button #tabButton class="tab-button"
              [class.tab-active]="viewMode() === tab.value"
              (click)="onViewModeChange(tab.value)">
        <div class="tab-content-inner">
          <span>{{ tab.label }}</span>
          @if (tab.badge && tab.badge() > 0) {
            <span class="tab-badge">{{ tab.badge() }}</span>
          }
        </div>
      </button>
    }
  </div>
</div>
```

**TS pattern:**
```typescript
@ViewChild('tabsContainer') tabsContainer!: ElementRef;
@ViewChildren('tabButton') tabButtons!: QueryList<ElementRef>;
gliderStyle = signal<{ left: string; width: string }>({ left: '0px', width: '0px' });

viewTabs = [
  { value: 'all', label: 'Todas' },
  { value: 'my', label: 'Mis Items', badge: this.myCount },
];

// In constructor:
effect(() => {
  const mode = this.viewMode();
  if (mode) setTimeout(() => this.updateGlider(), 50);
});

private updateGlider(): void {
  if (!this.tabsContainer || !this.tabButtons) return;
  const buttons = this.tabButtons.toArray();
  const idx = this.viewTabs.findIndex(t => t.value === this.viewMode());
  if (idx >= 0 && buttons[idx]) {
    const el = buttons[idx].nativeElement;
    this.gliderStyle.set({ left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` });
  }
}
```

**CSS pattern:**
```scss
.tabs-control-wrapper {
  margin-bottom: var(--space-md);
}
.tabs-container {
  position: relative;
  display: inline-flex;
  background: var(--color-bg-surface);
  border-radius: var(--radius-full);
  padding: 3px;
  gap: 2px;
}
.tab-glider {
  position: absolute;
  top: 3px;
  height: calc(100% - 6px);
  background: var(--color-bg-card);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);
  transition: left 0.35s cubic-bezier(0.25, 0.8, 0.25, 1),
              width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 0;
}
.tab-button {
  position: relative;
  z-index: 1;
  padding: 6px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
  white-space: nowrap;
  &.tab-active { color: var(--hsk-primary); font-weight: 600; }
}
.tab-badge {
  font-size: 11px;
  background: var(--hsk-primary);
  color: white;
  border-radius: var(--radius-full);
  padding: 1px 7px;
  font-weight: 600;
}
```

## Examples

### Example: Data Table with `p-table` (PrimeNG)

**Standard for ALL new tables.** Uses skeleton loading, compact size, full-height flex, and out-of-table filters. `app-table` is deprecated.

### Canonical table standard: `Tareas criticas`

This is the official baseline for management tables across the project. New CRUD/list pages should replicate this pattern unless a page has a justified exception.

Mandatory rules:
- Use `p-table` with: `[size]="'small'"`, `[scrollable]="true"`, `scrollHeight="flex"`, paginator enabled and `rowsPerPageOptions`.
- Keep table inside a flex chain so it always fills available height and does not break at high zoom.
- Force horizontal resilience with `[tableStyle]="{ 'min-width': '50rem' }"` (or larger according to columns).
- Use `app-filter-panel` in header actions and include filters for each meaningful data column.
- Do not create filters for the actions column.
- Show active filter chips under the header when filters are applied.
- Actions column must be fixed width, centered header and centered icon-only row actions.
- Row actions use `p-button` icon-only: `[text]="true"`, `[rounded]="true"`, `size="small"`.
- Paginator stays at the bottom (PrimeNG default with `p-table` paginator).
- Loading state should use skeleton rows in `#body`.

Long text fields (description/notes) standard:
- Truncate in-cell using ellipsis class.
- Reveal full text with `pTooltip` on hover.
- Keep tooltip theme from PrimeNG Aura + global overrides (no local hardcoded tooltip colors).

Recommended structure (based on `tasks-list` + tooltip pattern from `leader-findings`):

```html
<div class="page-shell">
  <div class="page-surface">
    <div class="table-header-row">
      <h1 class="title">Modulo</h1>
      <div class="header-actions">
        <app-filter-panel
          [fields]="filterFields"
          [values]="filterValues()"
          (apply)="onFilterApplied($event)"
          (cleared)="onFilterCleared()"
        />
        <app-primary-button label="Nuevo" icon="pi pi-plus" variant="primary" (click)="openCreate()" />
      </div>
    </div>

    @if (hasActiveFilters()) {
      <div class="active-filters">
        @for (chip of activeFilterChips(); track chip) {
          <span class="active-filter-chip">{{ chip }}</span>
        }
      </div>
    }

    <div class="table-wrapper">
      <p-table
        [value]="loading() ? skeletonRows : filteredItems()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        [size]="'small'"
        [scrollable]="true"
        scrollHeight="flex"
        [tableStyle]="{ 'min-width': '50rem' }"
      >
        <ng-template #header>
          <tr>
            <th>Nombre</th>
            <th style="width: 260px">Descripcion</th>
            <th style="width: 100px; text-align: center">Acciones</th>
          </tr>
        </ng-template>

        <ng-template #body let-row>
          @if (loading()) {
            <tr>
              <td><p-skeleton height="1.25rem" /></td>
              <td><p-skeleton height="1.25rem" /></td>
              <td><p-skeleton height="1.25rem" width="4rem" /></td>
            </tr>
          } @else {
            <tr>
              <td>{{ row.name }}</td>
              <td>
                <span class="td-ellipsis" [pTooltip]="row.description" tooltipPosition="top" [tooltipOptions]="{ showDelay: 300 }">
                  {{ row.description }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" size="small" (click)="openEdit(row)" />
                  <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" size="small" (click)="openDelete(row)" />
                </div>
              </td>
            </tr>
          }
        </ng-template>
      </p-table>
    </div>
  </div>
</div>
```

Required SCSS contract for zoom/height stability:

```scss
:host {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.page-shell,
.page-surface {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.table-header-row,
.active-filters {
  flex-shrink: 0;
}

.table-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.td-ellipsis {
  max-width: 320px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
```

### Official filter pattern for management tables

For CRUD/administration views, filters must follow this pattern:

1. Use `app-filter-panel` in the header actions.
2. Cover all data columns that are meaningful to search/filter.
3. Do not include the actions column in filters.
4. Keep filter state reactive with signals/computed.
5. Optionally show active-filter chips below the header.

### Official simple confirmation modal pattern

For quick destructive/confirmation dialogs, use a lightweight modal pattern with:

1. Strong title (delete/deactivate/save confirmation).
2. Close button (X) at top-right.
3. Warning strip for irreversible impact.
4. Optional contextual help text with entity name/effect.
5. Footer with two actions, equal visual weight in layout:
  - `Cancelar` (secondary)
  - primary contextual action (`Eliminar`, `Desactivar`, `Guardar`)
6. Optional confirmation checkbox for sensitive operations.

Use design tokens for all colors, spacing and radius. Avoid native `confirm()` in these flows.

**Imports:**
```typescript
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
```

**Component state:**
```typescript
items = signal<Item[]>([]);
loading = signal(true);

// Reactive out-of-table filters (computed)
filterName = signal('');
filteredItems = computed(() =>
  this.items().filter(i => !this.filterName() || i.name.toLowerCase().includes(this.filterName().toLowerCase()))
);

// Skeleton placeholder rows (always 8)
readonly skeletonRows = Array.from({ length: 8 }, () => ({}));
```

**HTML structure:**
```html
<!-- Container must be flex column with flex: 1 1 auto; min-height: 0 -->
<div class="page-container">

  <!-- Header: title + create CTA -->
  <div class="page-header">
    <h1 class="title">Items</h1>
    <button class="btn btn-primary" (click)="openCreate()">
      <span>Nuevo Item</span>
      <i class="pi pi-plus"></i>
    </button>
  </div>

  <!-- Filters OUTSIDE the table -->
  <div class="filter-bar">
    <div class="filter-field">
      <p-floatlabel variant="on">
        <input pInputText id="f-name" [ngModel]="filterName()" (ngModelChange)="filterName.set($event)" style="width: 100%" />
        <label for="f-name">Nombre</label>
      </p-floatlabel>
    </div>
    <div class="filter-field">
      <p-floatlabel variant="on">
        <p-select inputId="f-status" [ngModel]="filterStatus()" [options]="statusOptions"
                  (onChange)="filterStatus.set($event.value)" [showClear]="true" style="width: 100%" />
        <label for="f-status">Estado</label>
      </p-floatlabel>
    </div>
    @if (hasFilters) {
      <button class="btn btn-ghost" (click)="clearFilters()">
        <i class="pi pi-filter-slash"></i> Limpiar
      </button>
    }
  </div>

  <!-- Table wrapper fills remaining flex space -->
  <div class="table-wrapper">
    <p-table
      [value]="loading() ? skeletonRows : filteredItems()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[10, 25, 50]"
      [size]="'small'"
      [scrollable]="true"
      scrollHeight="flex"
      [tableStyle]="{ 'min-width': '50rem' }"
    >
      <ng-template #header>
        <tr>
          <th>Nombre</th>
          <th style="width: 130px">Estado</th>
          <th style="width: 100px; text-align: center">Acciones</th>
        </tr>
      </ng-template>

      <ng-template #body let-item>
        @if (loading()) {
          <tr>
            <td><p-skeleton height="1.25rem" /></td>
            <td><p-skeleton height="1.25rem" width="5rem" /></td>
            <td><p-skeleton height="1.25rem" width="4rem" /></td>
          </tr>
        } @else {
          <tr>
            <td>{{ item.name }}</td>
            <td>
              <p-tag [value]="item.status === 'active' ? 'Activo' : 'Inactivo'"
                     [severity]="item.status === 'active' ? 'success' : 'secondary'" />
            </td>
            <td>
              <div class="row-actions">
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" size="small" (click)="openEdit(item)" />
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" size="small" (click)="openDelete(item)" />
              </div>
            </td>
          </tr>
        }
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td colspan="3">
            <div class="empty-state">
              <img src="assets/img/void.png" alt="Sin datos" width="300" />
              <p class="empty-title">No se encontraron resultados</p>
              <p class="empty-desc">Crea el primer registro para comenzar.</p>
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>

</div>
```

**Required SCSS for table host:**
```scss
// Container must form a flex chain for scrollHeight="flex" to work
.page-container {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  // white card styles here
}
.page-header { flex-shrink: 0; }
.filter-bar   { flex-shrink: 0; }

.table-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.filter-field {
  flex: 1;
  min-width: 130px;
}
.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 24px;
  text-align: center;
}
.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}
.empty-desc {
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
  margin: 0;
}
```

```

### Table cell — `ellipsis + tooltip` pattern

Use this pattern when a table cell can contain very long text (descriptions, notes). Visual behaviour: the cell truncates with ellipsis and the full text is exposed on hover using PrimeNG tooltip. This keeps rows compact and accessible.

Guidelines:
- Apply a fixed `max-width` to the cell (component-level decision) so the ellipsis behaves predictably.
- Use `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` on the cell element.
- Attach `pTooltip` to the same element showing the truncated text (or to a wrapping span). Configure `tooltipPosition="top"` and an optional `showDelay` if desired.
- Import `TooltipModule` in the component that uses this pattern.
- Do not hardcode tooltip colors — the Aura theme + `_primeng-overrides.scss` provide the branded look (navy background / white text). If a different color is required, prefer adding a theme variation in `_primeng-overrides.scss` and reference tokens.

HTML example:

```html
<ng-template appTableCell="description" let-row>
  <span class="td-ellipsis" [pTooltip]="row.description" tooltipPosition="top" [tooltipOptions]="{ showDelay: 300 }">
    {{ row.description | slice:0:60 }}{{ row.description?.length > 60 ? '…' : '' }}
  </span>
</ng-template>
```

SCSS example (component or shared utilities):

```scss
.td-ellipsis {
  max-width: 320px; // choose per table layout
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
```

Notes:
- Prefer placing `.td-ellipsis` in a component SCSS file or in `src/styles/_utilities.scss` for reuse.
- Tooltip content should be plain text; if you need formatted HTML inside tooltip, create a custom popover component instead of relying on `pTooltip`.
- Ensure `overlayAppendTo: 'body'` is enabled in `providePrimeNG()` (project default) so tooltips are not clipped inside overflowed containers.

### Example: FloatLabel inputs and selects

**ALWAYS** use `p-floatlabel variant="on"` for form inputs and selects. Never use standalone `<label>` above an input.

```typescript
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
```

```html
<!-- Text input -->
<p-floatlabel variant="on">
  <input pInputText id="field-name" [(ngModel)]="value" style="width: 100%" />
  <label for="field-name">Nombre</label>
</p-floatlabel>

<!-- Select (use inputId, not id) -->
<p-floatlabel variant="on">
  <p-select inputId="field-status" [(ngModel)]="status" [options]="options"
            optionLabel="label" optionValue="value" [showClear]="true" style="width: 100%" />
  <label for="field-status">Estado</label>
</p-floatlabel>
```

> Float label active color is globally set to `--hsk-primary` (navy) in `_primeng-overrides.scss`.
> Focus ring on inputs/selects uses `--input-border-focus` + `--input-shadow-focus`.

### Example: Create a content card

```html
<div class="content-card">
  <h3 class="content-card__title">Title</h3>
  <p class="content-card__description">Description</p>
</div>
```

```css
.content-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: var(--space-lg);
}
.content-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-heading);
}
.content-card__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

### Example: Modal with 50/50 buttons

```html
<app-modal [visible]="showModal" title="Confirmar acción" size="sm" (close)="close()">
  <p>¿Estás seguro de continuar?</p>
  <div modal-footer>
    <app-primary-button label="Cancelar" variant="secondary" (click)="close()"/>
    <app-primary-button label="Confirmar" variant="primary" (click)="confirm()"/>
  </div>
</app-modal>
```

### Example: Dashboard grid module

```css
.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-md);
}
.module-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: var(--space-lg);
  transition: box-shadow var(--transition-base);
}
.module-card:hover {
  box-shadow: var(--shadow-md);
}
```
