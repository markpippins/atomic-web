import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Framework } from '../../models/models';
import { toSignal } from '@angular/core/rxjs-interop';
import { FrameworkFormComponent } from './framework-form.component';

@Component({
    selector: 'app-framework-list',
    imports: [CommonModule, FrameworkFormComponent],
    template: `
    <div class="framework-list-container">
      <header>
        <h2>Frameworks</h2>
        <button class="btn-primary" (click)="showAddForm()">Add Framework</button>
      </header>

      <div class="grid">
        @for (framework of frameworks(); track framework.id) {
          <div class="card">
            <div class="card-header">
              <h3>{{ framework.name }}</h3>
              <span class="badge">{{ framework.latestVersion }}</span>
            </div>
            <p class="description">{{ framework.description }}</p>
            <div class="details">
              <span class="tag category">{{ framework.category?.name }}</span>
              <span class="tag language">{{ framework.language?.name }}</span>
            </div>
            <div class="actions">
              <button class="btn-icon" (click)="editFramework(framework)">✏️</button>
              <button class="btn-icon delete" (click)="deleteFramework(framework)">🗑️</button>
            </div>
          </div>
        }
      </div>

      @if (showForm()) {
        <app-framework-form
          [framework]="selectedFramework()"
          (save)="onSave($event)"
          (cancel)="onCancel()"
        ></app-framework-form>
      }
    </div>
  `,
    styles: [`
    .framework-list-container { padding: 2rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .card {
      background: #1e1e1e; border-radius: 8px; padding: 1.5rem;
      border: 1px solid #333; transition: transform 0.2s;
    }
    .card:hover { transform: translateY(-2px); border-color: #555; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .card-header h3 { margin: 0; color: #fff; }
    .badge { background: #333; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
    .description { color: #aaa; font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.4; }
    .details { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .tag { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; }
    .tag.category { background: rgba(0, 123, 255, 0.2); color: #66b0ff; }
    .tag.language { background: rgba(40, 167, 69, 0.2); color: #75d69c; }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid #333; padding-top: 1rem; }
    .btn-primary { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 1.2rem; padding: 0.25rem; }
    .btn-icon:hover { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .btn-icon.delete:hover { background: rgba(220, 53, 69, 0.2); }
  `]
})
export class FrameworkListComponent {
    private apiService = inject(ApiService);

    frameworks = toSignal(this.apiService.getFrameworks(), { initialValue: [] });
    showForm = signal(false);
    selectedFramework = signal<Framework | null>(null);

    showAddForm() {
        this.selectedFramework.set(null);
        this.showForm.set(true);
    }

    editFramework(framework: Framework) {
        this.selectedFramework.set(framework);
        this.showForm.set(true);
    }

    deleteFramework(framework: Framework) {
        if (confirm(`Are you sure you want to delete ${framework.name}?`)) {
            this.apiService.deleteFramework(framework.id).subscribe(() => {
                window.location.reload(); // Temporary refresh
            });
        }
    }

    onSave(framework: Partial<Framework>) {
        const selected = this.selectedFramework();
        if (selected) {
            this.apiService.updateFramework(selected.id, framework).subscribe(() => {
                this.showForm.set(false);
                window.location.reload(); // Temporary refresh
            });
        } else {
            this.apiService.createFramework(framework).subscribe(() => {
                this.showForm.set(false);
                window.location.reload(); // Temporary refresh
            });
        }
    }

    onCancel() {
        this.showForm.set(false);
    }
}
