import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSystemNode } from '../../models/file-system.model.js';
import { TreeNodeComponent } from '../tree-node/tree-node.component.js';
import { ImageService } from '../../services/image.service.js';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  imports: [CommonModule, TreeNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeViewComponent {
  rootNode = input.required<FileSystemNode>();
  currentPath = input.required<string[]>();
  expansionCommand = input<{ command: 'expand' | 'collapse', id: number } | null>();
  imageService = input<ImageService | null>(null);
  
  pathChange = output<string[]>();
  loadChildren = output<string[]>();

  onPathChange(path: string[]): void {
    this.pathChange.emit(path);
  }

  onLoadChildren(path: string[]): void {
    this.loadChildren.emit(path);
  }
}
