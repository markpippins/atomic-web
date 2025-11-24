import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Framework, FrameworkCategory, FrameworkLanguage } from '../../models/models';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-framework-form',
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="modal-overlay" (click)="cancel.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>{{ framework() ? 'Edit' : 'Add' }} Framework</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" type="text" formControlName="name" placeholder="Framework Name">
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" formControlName="description" placeholder="Description"></textarea>
          </div>

          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" formControlName="category">
              <option [ngValue]="null">Select Category</option>
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat">{{ cat.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="language">Language</label>
            <select id="language" formControlName="language">
              <option [ngValue]="null">Select Language</option>
              @for (lang of languages(); track lang.id) {
                <option [ngValue]="lang">{{ lang.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="latestVersion">Latest Version</label>
            <input id="latestVersion" type="text" formControlName="latestVersion" placeholder="e.g. 17.0.0">
          </div>

          <div class="form-group">
            <label for="documentationUrl">Documentation URL</label>
            <input id="documentationUrl" type="text" formControlName="documentationUrl" placeholder="https://...">
          </div>

          <div class="form-group checkbox">
            <label>
              <input type="checkbox" formControlName="supportsBrokerPattern">
              Supports Broker Pattern
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="cancel.emit()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex; justify-content: center; align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: #1e1e1e; padding: 2rem; border-radius: 8px;
      width: 500px; max-width: 90%;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; color: #ccc; }
    input, select, textarea {
      width: 100%; padding: 0.5rem;
      background: #2d2d2d; border: 1px solid #3d3d3d;
      color: #fff; border-radius: 4px;
    }
    .checkbox { display: flex; align-items: center; }
    .checkbox input { width: auto; margin-right: 0.5rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .btn-primary { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .btn-secondary { background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class FrameworkFormComponent {
    private fb = inject(FormBuilder);
    private apiService = inject(ApiService);

    framework = signal<Framework | null>(null);
    save = output<Partial<Framework>>();
    cancel = output<void>();

    categories = toSignal(this.apiService.getFrameworkCategories(), { initialValue: [] });
    languages = toSignal(this.apiService.getFrameworkLanguages(), { initialValue: [] });

    form = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        category: [null as FrameworkCategory | null, Validators.required],
        language: [null as FrameworkLanguage | null, Validators.required],
        latestVersion: [''],
        documentationUrl: [''],
        supportsBrokerPattern: [false]
    });

    constructor() {
        effect(() => {
            const f = this.framework();
            if (f) {
                this.form.patchValue(f);
            } else {
                this.form.reset({
                    category: null,
                    language: null,
                    supportsBrokerPattern: false
                });
            }
        });
    }

    onSubmit() {
        if (this.form.valid) {
            this.save.emit(this.form.value as Partial<Framework>);
        }
    }
}

import { output } from '@angular/core';
