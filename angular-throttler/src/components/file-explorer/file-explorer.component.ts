import { Component, ChangeDetectionStrategy, signal, computed, effect, inject, ViewChildren, QueryList, ElementRef, Renderer2, OnDestroy, ViewChild, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSystemNode, SearchResultNode } from '../../models/file-system.model.js';
import { FileSystemProvider, ItemReference } from '../../services/file-system-provider.js';
import { ImageService } from '../../services/image.service.js';
import { ToolbarComponent, SortCriteria } from '../toolbar/toolbar.component.js';
import { FolderComponent } from '../folder/folder.component.js';
import { ClipboardService } from '../../services/clipboard.service.js';
import { SearchResultsComponent } from '../search-results/search-results.component.js';
import { PropertiesDialogComponent } from '../properties-dialog/properties-dialog.component.js';
import { DestinationNodeComponent } from '../destination-node/destination-node.component.js';
import { BottomPaneComponent } from '../bottom-pane/bottom-pane.component.js';

export { SearchResultNode };

interface FileSystemState {
  status: 'loading' | 'success' | 'error';
  items: FileSystemNode[];
  error?: string;
}

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  imports: [CommonModule, ToolbarComponent, FolderComponent, SearchResultsComponent, PropertiesDialogComponent, DestinationNodeComponent, BottomPaneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileExplorerComponent implements OnDestroy {
  private renderer = inject(Renderer2);
  private clipboardService = inject(ClipboardService);

  // Inputs & Outputs for multi-pane communication
  id = input.required<number>();
  path = input.required<string[]>();
  isActive = input(false);
  isSplitView = input(false);
  fileSystemProvider = input.required<FileSystemProvider>();
  imageService = input.required<ImageService>();
  folderTree = input<FileSystemNode | null>(null);
  searchResults = input<{ id: number; results: SearchResultNode[] } | null>(null);

  activated = output<number>();
  pathChanged = output<string[]>();
  searchInitiated = output<void>();
  searchCompleted = output<void>();
  quickSearch = output<string>();
  itemSelected = output<FileSystemNode | null>();
  directoryChanged = output<void>();

  rootName = signal('...');
  state = signal<FileSystemState>({ status: 'loading', items: [] });
  contextMenu = signal<{ x: number; y: number; item: FileSystemNode | null } | null>(null);
  previewItem = signal<FileSystemNode | null>(null);
  failedImageItems = signal<Set<string>>(new Set());
  isDragOverMainArea = signal(false);
  
  quickSearchQuery = signal('');

  // Destination Submenu State
  destinationSubMenu = signal<{ operation: 'copy' | 'move', x: number, y: number } | null>(null);
  private destinationSubMenuTimer: any;

  // View state
  viewMode = signal<'explorer' | 'search'>('explorer');
  isBottomPaneVisible = signal(false);
  currentSearchResults = signal<SearchResultNode[]>([]);
  isPreviewLoading = signal(false);

  // Bottom pane resizing
  bottomPaneHeight = signal(320);
  isResizingBottomPane = signal(false);
  private unlistenBottomPaneMouseMove: (() => void) | null = null;
  private unlistenBottomPaneMouseUp: (() => void) | null = null;
  
  // Selection
  selectedItems = signal<Set<string>>(new Set());
  private lastSelectedItemName = signal<string | null>(null);

  // UI State
  isShareDialogOpen = signal(false);
  isPropertiesDialogOpen = signal(false);
  propertiesItem = signal<FileSystemNode | null>(null);
  sortCriteria = signal<SortCriteria>({ key: 'name', direction: 'asc' });

  // Lasso selection state
  isLassoing = signal(false);
  lassoRect = signal<{ x: number; y: number; width: number; height: number } | null>(null);
  private lassoStartPoint = { x: 0, y: 0 };
  private mainContentRect: DOMRect | null = null;
  private initialSelectionOnLasso = new Set<string>();
  
  private unlistenMouseMove: (() => void) | null = null;
  private unlistenMouseUp: (() => void) | null = null;

  @ViewChild('mainContent') mainContentEl!: ElementRef<HTMLDivElement>;
  @ViewChildren('selectableItem', { read: ElementRef }) selectableItemElements!: QueryList<ElementRef>;

  // Computed properties for UI binding
  isHighlighted = computed(() => this.isActive() && this.isSplitView());
  canCutCopyShareDelete = computed(() => this.selectedItems().size > 0);
  canCopyToMoveTo = computed(() => this.selectedItems().size > 0);
  canPaste = computed(() => {
    const clip = this.clipboardService.clipboard();
    if (!clip) return false;
    const currentProvider = this.fileSystemProvider();
    return clip.sourceProvider.constructor.name === currentProvider.constructor.name;
  });
  canRename = computed(() => this.selectedItems().size === 1);
  canGoUp = computed(() => this.path().length > 0);
  isAtHomeRoot = computed(() => this.path().length === 0);
  
  // The path passed to the provider, which excludes the root segment (server name)
  private providerPath = computed(() => {
    const p = this.path();
    return p.length > 0 ? p.slice(1) : [];
  });
  
  displayPath = computed(() => {
    // The display path is the same as the provider path.
    return this.providerPath();
  });

  sortedItems = computed(() => {
    const items = [...this.state().items];
    const { key, direction } = this.sortCriteria();
    const directionMultiplier = direction === 'asc' ? 1 : -1;

    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      let valA: string | number, valB: string | number;

      if (key === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else { // modified
        valA = a.modified ? new Date(a.modified).getTime() : 0;
        valB = b.modified ? new Date(b.modified).getTime() : 0;
      }

      if (valA < valB) return -1 * directionMultiplier;
      if (valA > valB) return 1 * directionMultiplier;
      return 0;
    });

    return items;
  });

  constructor() {
    effect(() => {
      // When provider or path changes, load contents
      this.loadContents();
    });

    effect(() => {
      const provider = this.fileSystemProvider();
      provider.getFolderTree()
        .then(root => {
          this.rootName.set(root.name);
        })
        .catch(err => {
          console.error('Failed to get root name', err);
          this.rootName.set('Error');
        });
    }, { allowSignalWrites: true });

    effect(() => {
      this.updateForSearchResults(this.searchResults());
    });
  }

  ngOnDestroy(): void {
    this.stopLassoing();
    this.stopBottomPaneResize();
    // Re-enable text selection when component is destroyed
    this.renderer.removeStyle(document.body, 'user-select');
  }
  
  // --- Data Loading ---
  async loadContents(): Promise<void> {
    this.state.set({ status: 'loading', items: [] });
    try {
      const items = await this.fileSystemProvider().getContents(this.providerPath());
      this.state.set({ status: 'success', items: items });
    } catch (e: unknown) {
      this.state.set({ status: 'error', items: [], error: (e as Error).message });
    }
  }

  updateForSearchResults(search: { id: number; results: SearchResultNode[] } | null): void {
    if (search && search.id === this.id()) {
      this.viewMode.set('search');
      this.currentSearchResults.set(search.results);
    } else {
      this.viewMode.set('explorer');
      this.currentSearchResults.set([]);
    }
  }

  // --- Navigation ---
  goUp(): void {
    if (this.canGoUp()) {
      this.pathChanged.emit(this.path().slice(0, -1));
    }
  }

  navigateToPath(displayIndex: number): void {
    // We navigate within the full path. The displayIndex is relative to the displayPath.
    // displayIndex: -1 for the root, 0 for the first segment, etc.
    // The new path length will be displayIndex + 2 (e.g., -1 -> 1, 0 -> 2)
    const newPath = this.path().slice(0, displayIndex + 2);
    this.pathChanged.emit(newPath);
  }

  async openItem(item: FileSystemNode): Promise<void> {
    if (item.type === 'folder') {
      this.pathChanged.emit([...this.path(), item.name]);
      return;
    }

    // Show preview modal immediately
    this.previewItem.set(item);

    // If content is already present (e.g., from Convex service), no need to fetch.
    if (item.content) {
      return;
    }

    this.isPreviewLoading.set(true);
    try {
      const content = await this.fileSystemProvider().getFileContent(this.providerPath(), item.name);
      // Update the item in the previewItem signal with the fetched content
      this.previewItem.update(currentItem => currentItem ? { ...currentItem, content } : null);
    } catch (e) {
      console.error('Failed to get file content', e);
      const errorMessage = `Error loading file content: ${(e as Error).message}`;
      this.previewItem.update(currentItem => currentItem ? { ...currentItem, content: errorMessage } : null);
    } finally {
      this.isPreviewLoading.set(false);
    }
  }

  isImageFile(filename: string): boolean {
    const extension = this.getFileExtension(filename);
    if (!extension) return false;
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension.toLowerCase());
  }

  private getFileExtension(filename: string): string | null {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === 0) {
      return null;
    }
    return filename.substring(lastDot + 1);
  }

  closePreview(): void {
    this.previewItem.set(null);
    this.isPreviewLoading.set(false);
  }
  
  // --- Selection Logic ---
  onItemClick(event: MouseEvent, item: FileSystemNode): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.closeDestinationSubMenu();
    
    const isCtrlOrMeta = event.metaKey || event.ctrlKey;
    const isShift = event.shiftKey;
    const itemName = item.name;

    if (isShift && this.lastSelectedItemName()) {
      this.handleShiftSelection(itemName);
    } else if (isCtrlOrMeta) {
      this.handleCtrlMetaSelection(itemName);
    } else {
      this.handleSingleSelection(itemName);
    }

    this.updateSingleSelectedItem();
  }

  private handleSingleSelection(itemName: string): void {
    this.selectedItems.set(new Set([itemName]));
    this.lastSelectedItemName.set(itemName);
  }

  private handleCtrlMetaSelection(itemName: string): void {
    this.selectedItems.update(currentSelection => {
      const newSelection = new Set(currentSelection);
      if (newSelection.has(itemName)) {
        newSelection.delete(itemName);
      } else {
        newSelection.add(itemName);
      }
      return newSelection;
    });
    if (this.selectedItems().has(itemName)) {
      this.lastSelectedItemName.set(itemName);
    } else {
      this.lastSelectedItemName.set(null);
    }
  }

  private handleShiftSelection(itemName: string): void {
    const items = this.sortedItems();
    const lastSelectedIdx = items.findIndex(i => i.name === this.lastSelectedItemName());
    const currentIdx = items.findIndex(i => i.name === itemName);

    if (lastSelectedIdx === -1 || currentIdx === -1) {
        this.handleSingleSelection(itemName);
        return;
    }

    const start = Math.min(lastSelectedIdx, currentIdx);
    const end = Math.max(lastSelectedIdx, currentIdx);
    const itemsToSelect = items.slice(start, end + 1).map(i => i.name);

    this.selectedItems.update(currentSelection => {
        const newSelection = new Set(currentSelection);
        itemsToSelect.forEach(name => newSelection.add(name));
        return newSelection;
    });
  }
  
  private updateSingleSelectedItem(): void {
    const selection = this.selectedItems();
    if (selection.size === 1) {
      const itemName = selection.values().next().value;
      const item = this.state().items.find(i => i.name === itemName);
      this.itemSelected.emit(item ?? null);
    } else {
      this.itemSelected.emit(null);
    }
  }

  private getSelectedNodes(): FileSystemNode[] {
    const selection = this.selectedItems();
    return this.state().items.filter(i => selection.has(i.name));
  }
  
  private getItemReference(node: FileSystemNode): ItemReference {
    return { name: node.name, type: node.type };
  }
  
  private getSelectedItemReferences(): ItemReference[] {
    return this.getSelectedNodes().map(this.getItemReference);
  }

  // --- Context Menu ---
  onContextMenu(event: MouseEvent, item: FileSystemNode | null = null): void {
    event.preventDefault();
    event.stopPropagation();
    this.closeDestinationSubMenu();

    if (item && !this.selectedItems().has(item.name)) {
      this.handleSingleSelection(item.name);
      this.updateSingleSelectedItem();
    }
    
    this.contextMenu.set({ x: event.clientX, y: event.clientY, item });
  }

  closeContextMenu(): void {
    if (this.contextMenu()) {
      this.contextMenu.set(null);
    }
  }

  openDestinationSubMenu(operation: 'copy' | 'move', event: MouseEvent): void {
    clearTimeout(this.destinationSubMenuTimer);
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.destinationSubMenu.set({
      operation,
      x: rect.right,
      y: rect.top
    });
  }

  onDestinationSubMenuEnter(): void {
    clearTimeout(this.destinationSubMenuTimer);
  }

  onDestinationSubMenuLeave(): void {
    this.destinationSubMenuTimer = setTimeout(() => {
        this.closeDestinationSubMenu();
    }, 150);
  }

  closeDestinationSubMenu(): void {
    clearTimeout(this.destinationSubMenuTimer);
    if (this.destinationSubMenu()) {
      this.destinationSubMenu.set(null);
    }
  }

  // --- File Operations ---
  async createFolder(): Promise<void> {
    const name = prompt('Enter folder name:', 'New folder');
    if (name) {
      try {
        await this.fileSystemProvider().createDirectory(this.providerPath(), name);
        this.loadContents();
        this.directoryChanged.emit();
      } catch (e) {
        alert(`Error creating folder: ${(e as Error).message}`);
      }
    }
  }

  async createFile(): Promise<void> {
    const name = prompt('Enter file name:', 'New file.txt');
    if (name) {
      try {
        await this.fileSystemProvider().createFile(this.providerPath(), name);
        this.loadContents();
      } catch (e) {
        alert(`Error creating file: ${(e as Error).message}`);
      }
    }
  }

  async onFilesUploaded(files: FileList): Promise<void> {
    this.state.update(s => ({ ...s, status: 'loading' }));
    try {
      await Promise.all(
        Array.from(files).map(file => this.fileSystemProvider().uploadFile(this.providerPath(), file))
      );
    } catch (e) {
      alert(`Error uploading files: ${(e as Error).message}`);
    } finally {
      this.loadContents();
    }
  }
  
  onCut(): void {
    this.clipboardService.set({
      operation: 'cut',
      sourceProvider: this.fileSystemProvider(),
      sourcePath: this.path(),
      items: this.getSelectedNodes()
    });
  }
  
  onCopy(): void {
    this.clipboardService.set({
      operation: 'copy',
      sourceProvider: this.fileSystemProvider(),
      sourcePath: this.path(),
      items: this.getSelectedNodes()
    });
  }
  
  async onPaste(): Promise<void> {
    const clip = this.clipboardService.get();
    if (!clip || !this.canPaste()) return;

    try {
      const itemRefs = clip.items.map(this.getItemReference);
      const sourceProviderPath = clip.sourcePath.length > 0 ? clip.sourcePath.slice(1) : [];
      if (clip.operation === 'cut') {
        await clip.sourceProvider.move(sourceProviderPath, this.providerPath(), itemRefs);
        this.clipboardService.clear();
      } else { // copy
        await clip.sourceProvider.copy(sourceProviderPath, this.providerPath(), itemRefs);
      }
    } catch (e) {
      alert(`Paste failed: ${(e as Error).message}`);
    } finally {
      this.loadContents();
      this.directoryChanged.emit();
    }
  }

  async onRename(): Promise<void> {
    const selectedNodes = this.getSelectedNodes();
    if (selectedNodes.length !== 1) return;

    const oldName = selectedNodes[0].name;
    const newName = prompt('Enter new name:', oldName);
    
    if (newName && newName !== oldName) {
      try {
        await this.fileSystemProvider().rename(this.providerPath(), oldName, newName);
        this.loadContents();
        this.directoryChanged.emit();
      } catch (e) {
        alert(`Rename failed: ${(e as Error).message}`);
      }
    }
  }

  async onMagnetize(item: FileSystemNode): Promise<void> {
    if (item.type !== 'folder' || item.name.endsWith('.magnet')) {
      return;
    }
    const oldName = item.name;
    const newName = `${oldName}.magnet`;
    try {
      await this.fileSystemProvider().rename(this.providerPath(), oldName, newName);
      this.loadContents();
      this.directoryChanged.emit();
    } catch (e) {
      alert(`Failed to magnetize folder: ${(e as Error).message}`);
    }
  }

  async executeCopyToMoveTo(operation: 'copy' | 'move', destPath: string[]): Promise<void> {
    const items = this.getSelectedItemReferences();
    if (items.length === 0) return;
    
    try {
        const destProviderPath = destPath.length > 0 ? destPath.slice(1) : [];
        if (operation === 'copy') {
            await this.fileSystemProvider().copy(this.providerPath(), destProviderPath, items);
        } else { // move
            await this.fileSystemProvider().move(this.providerPath(), destProviderPath, items);
        }
    } catch (e) {
        alert(`${operation} failed: ${(e as Error).message}`);
    } finally {
        this.loadContents();
        this.closeDestinationSubMenu();
        this.directoryChanged.emit();
    }
  }
  
  onItemsCopiedTo(destPath: string[]): void {
    this.executeCopyToMoveTo('copy', destPath);
  }
  
  onItemsMovedTo(destPath: string[]): void {
    this.executeCopyToMoveTo('move', destPath);
  }

  onShare(): void {
    this.isShareDialogOpen.set(true);
  }
  
  closeShareDialog(): void {
    this.isShareDialogOpen.set(false);
  }

  async onDelete(): Promise<void> {
    const selectedNodes = this.getSelectedNodes();
    if (selectedNodes.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedNodes.length} item(s)?`)) {
      try {
        await Promise.all(selectedNodes.map(node => {
          if (node.type === 'folder') {
            return this.fileSystemProvider().removeDirectory(this.providerPath(), node.name);
          } else {
            return this.fileSystemProvider().deleteFile(this.providerPath(), node.name);
          }
        }));
      } catch (e) {
        alert(`Delete failed: ${(e as Error).message}`);
      } finally {
        this.loadContents();
        this.directoryChanged.emit();
      }
    }
  }
  
  handleRenameFromContextMenu(): void {
    this.onRename();
    this.closeContextMenu();
  }

  handleCutFromContextMenu(): void {
    if (this.canCutCopyShareDelete()) {
      this.onCut();
    }
    this.closeContextMenu();
  }
  
  handleCopyFromContextMenu(): void {
    if (this.canCutCopyShareDelete()) {
      this.onCopy();
    }
    this.closeContextMenu();
  }

  handlePasteFromContextMenu(): void {
    if (this.canPaste()) {
      this.onPaste();
    }
    this.closeContextMenu();
  }

  handleMagnetizeFromContextMenu(): void {
    const item = this.contextMenu()?.item;
    if (item?.type === 'folder' && !item.name.endsWith('.magnet')) {
      this.onMagnetize(item);
    }
    this.closeContextMenu();
  }

  handleDeleteFromContextMenu(): void {
    this.onDelete();
    this.closeContextMenu();
  }
  
  handlePropertiesFromContextMenu(): void {
    const selected = this.getSelectedNodes();
    if (selected.length === 1) {
        this.propertiesItem.set(selected[0]);
        this.isPropertiesDialogOpen.set(true);
    }
    this.closeContextMenu();
  }

  closePropertiesDialog(): void {
    this.isPropertiesDialogOpen.set(false);
    this.propertiesItem.set(null);
  }
  
  // --- UI Handlers ---
  onSortChange(criteria: SortCriteria): void {
    this.sortCriteria.set(criteria);
  }

  getIconUrl(item: FileSystemNode): string | null {
    return this.imageService().getIconUrl(item);
  }

  onImageError(name: string): void {
    this.failedImageItems.update(set => new Set(set).add(name));
  }

  onSearchClick(): void {
    this.searchInitiated.emit();
  }

  onCloseSearchClick(): void {
    this.viewMode.set('explorer');
    this.searchCompleted.emit();
  }
  
  onQuickSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.quickSearchQuery.set(query);
  }

  onQuickSearchSubmit(): void {
    this.quickSearch.emit(this.quickSearchQuery());
  }
  
  onToggleBottomPane(): void {
    this.isBottomPaneVisible.update(v => !v);
  }

  // --- Drag & Drop ---
  onMainAreaDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
    }
    this.isDragOverMainArea.set(true);
  }

  onMainAreaDragLeave(event: DragEvent): void {
    // Check if the relatedTarget is outside the main content area
    if (!this.mainContentEl.nativeElement.contains(event.relatedTarget as Node)) {
        this.isDragOverMainArea.set(false);
    }
  }

  onMainAreaDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOverMainArea.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        this.onFilesUploaded(files);
    }
  }

  onFolderDrop(event: { files: FileList, item: FileSystemNode }): void {
    // This is a mock implementation. A real one would require path manipulation.
    console.log(`Dropped ${event.files.length} files onto ${event.item.name}`);
    alert(`Dropped ${event.files.length} files onto ${event.item.name}. Uploading to specific folders is not implemented yet.`);
  }

  // --- Lasso Selection ---
  onMainAreaMouseDown(event: MouseEvent): void {
    // Only start lasso if it's a primary button click on the background
    if (event.button !== 0 || (event.target as HTMLElement).closest('[data-is-selectable-item]')) {
      return;
    }
    event.preventDefault();
    this.closeContextMenu();
    this.closeDestinationSubMenu();
    this.startLassoing(event);
  }

  private startLassoing(event: MouseEvent): void {
    this.isLassoing.set(true);
    this.mainContentRect = this.mainContentEl.nativeElement.getBoundingClientRect();
    this.lassoStartPoint = { 
      x: event.clientX - this.mainContentRect.left, 
      y: event.clientY - this.mainContentRect.top 
    };
    
    // Disable text selection on the body while lassoing
    this.renderer.setStyle(document.body, 'user-select', 'none');
    
    // Store initial selection if user is holding ctrl/meta
    this.initialSelectionOnLasso = (event.metaKey || event.ctrlKey) ? new Set(this.selectedItems()) : new Set();
    if (!event.metaKey && !event.ctrlKey) {
        this.selectedItems.set(new Set());
    }

    this.lassoRect.set({ ...this.lassoStartPoint, width: 0, height: 0 });

    this.unlistenMouseMove = this.renderer.listen('document', 'mousemove', this.onLassoMove.bind(this));
    this.unlistenMouseUp = this.renderer.listen('document', 'mouseup', this.stopLassoing.bind(this));
  }
  
  private onLassoMove(event: MouseEvent): void {
    if (!this.isLassoing() || !this.mainContentRect) return;

    const currentX = event.clientX - this.mainContentRect.left;
    const currentY = event.clientY - this.mainContentRect.top;

    const x = Math.min(this.lassoStartPoint.x, currentX);
    const y = Math.min(this.lassoStartPoint.y, currentY);
    const width = Math.abs(currentX - this.lassoStartPoint.x);
    const height = Math.abs(currentY - this.lassoStartPoint.y);

    const newRect = { x, y, width, height };
    this.lassoRect.set(newRect);

    this.updateSelectionFromLasso(newRect);
  }
  
  private updateSelectionFromLasso(lasso: { x: number; y: number; width: number; height: number }): void {
    const lassoWithScroll = {
        ...lasso,
        x: lasso.x + this.mainContentEl.nativeElement.scrollLeft,
        y: lasso.y + this.mainContentEl.nativeElement.scrollTop
    };
    const newSelection = new Set(this.initialSelectionOnLasso);
    
    this.selectableItemElements.forEach(elRef => {
        const itemEl = elRef.nativeElement;
        const itemName = this.getItemNameFromElement(itemEl);
        if (!itemName) return;
        
        const itemRect = {
            left: itemEl.offsetLeft,
            top: itemEl.offsetTop,
            right: itemEl.offsetLeft + itemEl.offsetWidth,
            bottom: itemEl.offsetTop + itemEl.offsetHeight
        };
        
        const isIntersecting = 
            itemRect.left < lassoWithScroll.x + lassoWithScroll.width &&
            itemRect.right > lassoWithScroll.x &&
            itemRect.top < lassoWithScroll.y + lassoWithScroll.height &&
            itemRect.bottom > lassoWithScroll.y;

        if (isIntersecting) {
            newSelection.add(itemName);
        } else {
            // Only remove if it wasn't part of the initial selection on ctrl/meta drag
            if (!this.initialSelectionOnLasso.has(itemName)) {
                newSelection.delete(itemName);
            }
        }
    });

    this.selectedItems.set(newSelection);
  }

  private getItemNameFromElement(element: HTMLElement): string | null {
      // Logic to find the item name from the DOM element.
      // This is brittle. A better way would be a data attribute.
      const span = element.querySelector('span');
      return span ? span.textContent : null;
  }

  private stopLassoing(): void {
    if (!this.isLassoing()) return;
    
    this.isLassoing.set(false);
    this.lassoRect.set(null);
    this.updateSingleSelectedItem();

    if (this.unlistenMouseMove) {
      this.unlistenMouseMove();
      this.unlistenMouseMove = null;
    }
    if (this.unlistenMouseUp) {
      this.unlistenMouseUp();
      this.unlistenMouseUp = null;
    }

    // Re-enable text selection
    this.renderer.removeStyle(document.body, 'user-select');
  }

  // --- Bottom Pane Resizing ---
  startBottomPaneResize(event: MouseEvent): void {
    event.preventDefault();
    this.isResizingBottomPane.set(true);

    const startY = event.clientY;
    const startHeight = this.bottomPaneHeight();

    // Prevent text selection on the body while resizing
    this.renderer.setStyle(document.body, 'user-select', 'none');

    this.unlistenBottomPaneMouseMove = this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
      const dy = e.clientY - startY;
      let newHeight = startHeight - dy; // Dragging up increases height

      // Add constraints for min/max height
      if (newHeight < 100) newHeight = 100;
      if (newHeight > 600) newHeight = 600;

      this.bottomPaneHeight.set(newHeight);
    });

    this.unlistenBottomPaneMouseUp = this.renderer.listen('document', 'mouseup', () => {
      this.stopBottomPaneResize();
    });
  }

  private stopBottomPaneResize(): void {
    if (!this.isResizingBottomPane()) return;
    
    this.isResizingBottomPane.set(false);

    if (this.unlistenBottomPaneMouseMove) {
      this.unlistenBottomPaneMouseMove();
      this.unlistenBottomPaneMouseMove = null;
    }
    if (this.unlistenBottomPaneMouseUp) {
      this.unlistenBottomPaneMouseUp();
      this.unlistenBottomPaneMouseUp = null;
    }

    // Re-enable text selection
    this.renderer.removeStyle(document.body, 'user-select');
  }
}
