import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupItem } from '../../../services/platform-management.service.js';

@Component({
    selector: 'app-lookup-list',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-[rgb(var(--color-border-muted))] text-[rgb(var(--color-text-muted))] text-sm">
            <th class="p-3 font-medium w-1/4">Name</th>
            <th class="p-3 font-medium">Description</th>
            <th class="p-3 font-medium w-24 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items(); track item.id) {
            <tr class="border-b border-[rgb(var(--color-border-muted))] hover:bg-[rgb(var(--color-surface-hover))]">
              <td class="p-3 text-[rgb(var(--color-text-base))] font-medium">{{ item.name }}</td>
              <td class="p-3 text-[rgb(var(--color-text-muted))]">{{ item.description || '-' }}</td>
              <td class="p-3 text-right whitespace-nowrap">
                <button (click)="onEdit.emit(item)" class="text-[rgb(var(--color-accent-ring))] hover:underline mr-3">Edit</button>
                <button (click)="onDelete.emit(item)" class="text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3" class="p-8 text-center text-[rgb(var(--color-text-muted))]">
                No {{ type() | lowercase | replace:'-':' ' }} found.
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class LookupListComponent {
    items = input.required<LookupItem[]>();
    type = input.required<string>();

    onEdit = output<LookupItem>();
    onDelete = output<LookupItem>();
}
