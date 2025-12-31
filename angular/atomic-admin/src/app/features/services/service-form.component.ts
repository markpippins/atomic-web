import { Component, inject, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Service, Framework, ServiceType } from '../../models/models';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-service-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>{{ service() ? 'Edit' : 'Add' }} Service</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" type="text" formControlName="name" />
        </div>
        
        <div class="form-group">
          <label for="type">Type</label>
          <select id="type" formControlName="type">
            <option [ngValue]="null">Select Type</option>
            @for (type of serviceTypes(); track type.id) {
              <option [ngValue]="type">{{ type.name }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label for="framework">Framework</label>
          <select id="framework" formControlName="framework">
            <option [ngValue]="null">Select Framework</option>
            @for (fw of frameworks(); track fw.id) {
              <option [ngValue]="fw">{{ fw.name }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label for="defaultPort">Default Port</label>
          <input id="defaultPort" type="number" formControlName="defaultPort" />
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" formControlName="status">
            <option value="ACTIVE">Active</option>
            <option value="DEPRECATED">Deprecated</option>
            <option value="ARCHIVED">Archived</option>
            <option value="PLANNED">Planned</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" (click)="cancel.emit()">Cancel</button>
          <button type="submit" [disabled]="form.invalid">Save</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 600px;
      max-width: 90vw;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button[type="submit"] {
      background: #3498db;
      color: white;
    }
    button[type="button"] {
      background: #e0e0e0;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ServiceFormComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);

  service = input<Service | null>(null);
  save = output<void>();
  cancel = output<void>();

  serviceTypes = toSignal(this.apiService.getServiceTypes(), { initialValue: [] });
  frameworks = toSignal(this.apiService.getFrameworks(), { initialValue: [] });

  form = this.fb.group({
    name: ['', Validators.required],
    type: [null as ServiceType | null, Validators.required],
    framework: [null as Framework | null],
    defaultPort: [8080, Validators.required],
    status: ['ACTIVE', Validators.required]
  });

  constructor() {
    effect(() => {
      const s = this.service();
      if (s) {
        this.form.patchValue(s);
      } else {
        this.form.reset({
          type: null,
          defaultPort: 8080,
          status: 'ACTIVE'
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const val = this.form.value;
      const s = this.service();

      if (s) {
        this.apiService.updateService(s.id, val as Partial<Service>).subscribe(() => this.save.emit());
      } else {
        this.apiService.createService(val as Partial<Service>).subscribe(() => this.save.emit());
      }
    }
  }
}
