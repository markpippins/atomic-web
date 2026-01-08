import { Component, ChangeDetectionStrategy, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PlatformManagementService, LookupItem } from '../../../services/platform-management.service.js';

@Component({
    selector: 'app-upsert-lookup-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" *ngIf="isOpen()">
       <div class="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border-base))] shadow-xl rounded-lg w-full max-w-md flex flex-col">
          <div class="p-4 border-b border-[rgb(var(--color-border-base))] flex justify-between items-center">
            <h2 class="text-lg font-semibold text-[rgb(var(--color-text-base))] capitalize">
              {{ item() ? 'Edit' : 'Add' }} {{ type() | lowercase | replace:'-':' ' }}
            </h2>
            <button (click)="onCancel()" class="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))]">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="p-6">
             <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                 <!-- Name -->
                 <div class="flex flex-col gap-1">
                    <label class="text-sm font-medium text-[rgb(var(--color-text-base))]">Name *</label>
                    <input type="text" formControlName="name" class="p-2 rounded border border-[rgb(var(--color-border-muted))] bg-[rgb(var(--color-surface-input))] text-[rgb(var(--color-text-base))] focus:border-[rgb(var(--color-accent-ring))]" placeholder="Name">
                    <span class="text-xs text-red-500" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">Name is required</span>
                 </div>

                 <!-- Description -->
                 <div class="flex flex-col gap-1">
                    <label class="text-sm font-medium text-[rgb(var(--color-text-base))]">Description</label>
                    <textarea formControlName="description" rows="3" class="p-2 rounded border border-[rgb(var(--color-border-muted))] bg-[rgb(var(--color-surface-input))] text-[rgb(var(--color-text-base))] focus:border-[rgb(var(--color-accent-ring))]" placeholder="Description"></textarea>
                 </div>
             </form>
          </div>

          <div class="p-4 border-t border-[rgb(var(--color-border-base))] flex justify-end gap-3 bg-[rgb(var(--color-surface-sidebar))] rounded-b-lg">
             <button type="button" (click)="onCancel()" class="px-4 py-2 rounded text-[rgb(var(--color-text-base))] hover:bg-[rgb(var(--color-surface-hover))] border border-[rgb(var(--color-border-muted))]">Cancel</button>
             <button type="button" (click)="onSubmit()" [disabled]="form.invalid || isSaving()" class="px-4 py-2 rounded bg-[rgb(var(--color-accent-ring))] text-white hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2">
                <span *ngIf="isSaving()" class="material-icons text-sm animate-spin">refresh</span>
                Save
             </button>
          </div>
       </div>
    </div>
  `
})
export class UpsertLookupDialogComponent {
    private fb = inject(FormBuilder);
    private platformService = inject(PlatformManagementService);

    isOpen = input.required<boolean>();
    baseUrl = input.required<string>();
    type = input.required<string>();
    item = input<LookupItem | null>(null);

    close = output<void>();
    saved = output<LookupItem>();

    form: FormGroup;
    isSaving = signal(false);

    constructor() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });

        effect(() => {
            if (this.isOpen()) {
                const i = this.item();
                if (i) {
                    this.form.patchValue({
                        name: i.name,
                        description: i.description
                    });
                } else {
                    this.form.reset();
                }
            }
        });
    }

    onCancel() {
        this.close.emit();
    }

    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSaving.set(true);
        const url = this.baseUrl();
        const type = this.type();
        const payload: Partial<LookupItem> = this.form.value;

        try {
            let result: LookupItem;
            const currentItem = this.item();

            if (currentItem) {
                // Update
                result = await this.platformService.updateLookup(url, type, currentItem.id, payload);
            } else {
                // Create
                result = await this.platformService.createLookup(url, type, payload);
            }
            this.saved.emit(result);
            this.close.emit();
        } catch (e) {
            console.error(`Failed to save ${type}`, e);
            alert(`Failed to save ${type}`);
        } finally {
            this.isSaving.set(false);
        }
    }
}
