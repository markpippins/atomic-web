import { Component, inject, input, output, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Server, ServerType } from '../../models/models';

@Component({
  selector: 'app-server-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>{{ server() ? 'Edit' : 'Add' }} Server</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="hostname">Hostname</label>
          <input id="hostname" type="text" formControlName="hostname" />
        </div>
        
        <div class="form-group">
          <label for="ipAddress">IP Address</label>
          <input id="ipAddress" type="text" formControlName="ipAddress" />
        </div>

        <div class="form-group">
          <label for="type">Type</label>
          <label for="type">Type</label>
          <select id="type" formControlName="type">
            <option [ngValue]="null">Select Type</option>
            @for (type of serverTypes(); track type.id) {
              <option [ngValue]="type">{{ type.name }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label for="environment">Environment</label>
          <select id="environment" formControlName="environment">
            <option value="DEVELOPMENT">Development</option>
            <option value="STAGING">Staging</option>
            <option value="PRODUCTION">Production</option>
            <option value="TEST">Test</option>
          </select>
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" formControlName="status">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DECOMMISSIONED">Decommissioned</option>
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
export class ServerFormComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);

  server = input<Server | null>(null);
  save = output<void>();
  cancel = output<void>();

  serverTypes = toSignal(this.apiService.getServerTypes(), { initialValue: [] });

  form = this.fb.group({
    hostname: ['', Validators.required],
    ipAddress: ['', Validators.required],
    type: [null as ServerType | null, Validators.required],
    environment: ['DEVELOPMENT', Validators.required],
    status: ['ACTIVE', Validators.required]
  });

  constructor() {
    effect(() => {
      const s = this.server();
      if (s) {
        this.form.patchValue(s);
      } else {
        this.form.reset({
          type: null,
          environment: 'DEVELOPMENT',
          status: 'ACTIVE'
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const val = this.form.value;
      const s = this.server();

      if (s) {
        this.apiService.updateServer(s.id, val as Partial<Server>).subscribe(() => this.save.emit());
      } else {
        this.apiService.createServer(val as Partial<Server>).subscribe(() => this.save.emit());
      }
    }
  }
}
