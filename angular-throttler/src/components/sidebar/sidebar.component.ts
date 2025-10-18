import { Component, ChangeDetectionStrategy, signal, inject, Renderer2, OnDestroy, input, output } from '@angular/core';
import { TabControlComponent } from '../tabs/tab-control.component.js';
import { TabComponent } from '../tabs/tab.component.js';
import { NewsfeedComponent } from '../newsfeed/newsfeed.component.js';
import { VerticalToolbarComponent } from '../vertical-toolbar/vertical-toolbar.component.js';
import { SearchComponent } from '../search/search.component.js';
import { FileSystemNode } from '../../models/file-system.model.js';
import { TreeViewComponent } from '../tree-view/tree-view.component.js';
import { ImageService } from '../../services/image.service.js';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [TabControlComponent, TabComponent, NewsfeedComponent, VerticalToolbarComponent, SearchComponent, TreeViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnDestroy {
  folderTree = input<FileSystemNode | null>(null);
  currentPath = input<string[]>([]);
  imageService = input<ImageService | null>(null);
  
  pathChange = output<string[]>();
  refreshTree = output<void>();
  loadChildren = output<string[]>();

  isCollapsed = signal(false);
  width = signal(288); // Default width is 288px (w-72)
  isResizing = signal(false);
  treeExpansionCommand = signal<{ command: 'expand' | 'collapse', id: number } | null>(null);

  private preCollapseWidth = 288;
  private renderer = inject(Renderer2);
  
  private unlistenMouseMove: (() => void) | null = null;
  private unlistenMouseUp: (() => void) | null = null;

  toggleCollapse(): void {
    const collapsing = !this.isCollapsed();
    if (collapsing) {
      this.preCollapseWidth = this.width();
    }
    this.isCollapsed.set(collapsing);
    if (!collapsing) { // on expand
      this.width.set(this.preCollapseWidth);
    }
  }
  
  startResize(event: MouseEvent): void {
    if (this.isCollapsed()) return;

    this.isResizing.set(true);
    const startX = event.clientX;
    const startWidth = this.width();

    // Prevent text selection while dragging
    event.preventDefault();

    this.unlistenMouseMove = this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
      if (!this.isResizing()) {
        return;
      }
      const dx = e.clientX - startX;
      let newWidth = startWidth + dx;
      
      // Add constraints for min/max width
      if (newWidth < 150) newWidth = 150;
      if (newWidth > 500) newWidth = 500;
      
      this.width.set(newWidth);
    });

    this.unlistenMouseUp = this.renderer.listen('document', 'mouseup', () => {
      this.stopResize();
    });
  }

  private stopResize(): void {
    if (!this.isResizing()) return;
    this.isResizing.set(false);
    if (this.unlistenMouseMove) {
      this.unlistenMouseMove();
      this.unlistenMouseMove = null;
    }
    if (this.unlistenMouseUp) {
      this.unlistenMouseUp();
      this.unlistenMouseUp = null;
    }
  }

  onTreeViewPathChange(path: string[]): void {
    this.pathChange.emit(path);
  }

  onRefreshTree(): void {
    this.refreshTree.emit();
  }

  onExpandAll(): void {
    this.treeExpansionCommand.set({ command: 'expand', id: Date.now() });
  }

  onCollapseAll(): void {
    this.treeExpansionCommand.set({ command: 'collapse', id: Date.now() });
  }

  onLoadChildren(path: string[]): void {
    this.loadChildren.emit(path);
  }

  ngOnDestroy(): void {
    this.stopResize();
  }
}
