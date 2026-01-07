import { Component, ChangeDetectionStrategy, input, output, computed, signal, inject, Renderer2, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarkService } from '../../services/bookmark.service.js';
import { Bookmark } from '../../models/bookmark.model.js';
import { RssFeedComponent } from '../rss-feed/rss-feed.component.js';
import { WebviewService } from '../../services/webview.service.js';
import { UiPreferencesService } from '../../services/ui-preferences.service.js';
import { ServiceMeshService } from '../../services/service-mesh.service.js';
import { ServiceDetailsComponent } from '../service-details/service-details.component.js';
import { PlatformManagementComponent } from '../platform-management/platform-management.component.js';
import { HostProfileService } from '../../services/host-profile.service.js';

@Component({
  selector: 'app-detail-pane',
  standalone: true,
  templateUrl: './detail-pane.component.html',
  imports: [CommonModule, RssFeedComponent, ServiceDetailsComponent, PlatformManagementComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailPaneComponent implements OnDestroy {
  path = input.required<string[]>();
  isSavedItemsVisible = input(true);
  isRssFeedVisible = input(true);
  close = output<void>();
  manageRssFeeds = output<void>();

  private bookmarkService = inject(BookmarkService);
  private webviewService = inject(WebviewService);
  private renderer = inject(Renderer2);
  private uiPreferencesService = inject(UiPreferencesService);
  public serviceMeshService = inject(ServiceMeshService);
  private hostProfileService = inject(HostProfileService);

  // --- Resizing State & Logic for pane width ---
  width = signal(this.uiPreferencesService.detailPaneWidth() ?? 320);
  isResizing = signal(false);
  private unlistenMouseMove: (() => void) | null = null;
  private unlistenMouseUp: (() => void) | null = null;

  // --- Vertical Resizing State for internal panes ---
  savedPaneHeight = signal(this.uiPreferencesService.detailPaneSavedHeight() ?? 50); // This is a percentage
  isResizingVertical = signal(false);
  private unlistenVerticalMouseMove: (() => void) | null = null;
  private unlistenVerticalMouseUp: (() => void) | null = null;

  @ViewChild('contentContainer') contentContainerEl!: ElementRef<HTMLDivElement>;

  filterQuery = signal('');

  platformNode = computed(() => {
    const path = this.path();
    // Check if we are in a platform management path
    // Path structure: Root(ProfileName) / Platform Management / ManagementType
    // Or potentially deeper if nested

    // Find "Platform Management" in the path
    const pmIndex = path.indexOf('Platform Management');

    if (pmIndex !== -1 && pmIndex + 1 < path.length) {
      const managementType = path[pmIndex + 1].toLowerCase();

      // Root is at path[0] (or we need to find profile name from path)
      // If "Platform Control" is at index 1, root is 0.
      // If it is nested, we might look for root name.

      // HostServerProvider roots are usually at top level?
      // Let's assume root is path[0]
      const profileName = path[0];

      const profile = this.hostProfileService.profiles().find(p => p.name === profileName);

      if (profile) {
        const allowedTypes = ['services', 'frameworks', 'deployments', 'servers', 'lookup tables'];
        // Normalize type (remove spaces, etc if needed, but here simple match)
        // 'lookup tables' might need handling if path segment is 'Lookup Tables'

        const segment = path[pmIndex + 1].toLowerCase();
        const normalizedType = allowedTypes.find(t => t === segment);

        if (normalizedType) {
          // Calculate baseUrl
          let baseUrl = profile.hostServerUrl;
          if (!baseUrl.startsWith('http')) baseUrl = `http://${baseUrl}`;
          if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

          return { type: normalizedType, baseUrl };
        }
      }
    }
    return null;
  });

  bookmarks = computed(() => {
    const allBookmarks = this.bookmarkService.allBookmarks();
    const currentPathString = this.path().join('/');
    const query = this.filterQuery().toLowerCase();

    return allBookmarks
      .filter(b => b.path.startsWith(currentPathString))
      .filter(b => !query || b.title.toLowerCase().includes(query) || b.snippet?.toLowerCase().includes(query));
  });

  isRssPaneCollapsed = signal(false);

  onFilterChange(event: Event): void {
    this.filterQuery.set((event.target as HTMLInputElement).value);
  }

  deleteBookmark(id: string): void {
    this.bookmarkService.deleteBookmark(id);
  }

  openBookmark(bookmark: Bookmark): void {
    this.webviewService.open(bookmark.link, bookmark.title);
  }

  startResize(event: MouseEvent): void {
    this.isResizing.set(true);
    const startX = event.clientX;
    const startWidth = this.width();

    event.preventDefault();

    this.unlistenMouseMove = this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
      const dx = startX - e.clientX;
      let newWidth = startWidth + dx;

      if (newWidth < 200) newWidth = 200;
      if (newWidth > 600) newWidth = 600;

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
    this.uiPreferencesService.setDetailPaneWidth(this.width());
  }

  startVerticalResize(event: MouseEvent): void {
    this.isResizingVertical.set(true);
    const container = this.contentContainerEl.nativeElement;
    const containerRect = container.getBoundingClientRect();

    event.preventDefault();

    this.unlistenVerticalMouseMove = this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
      const mouseY = e.clientY - containerRect.top;
      let newHeightPercent = (mouseY / containerRect.height) * 100;

      const minHeightPercent = 15;
      const maxHeightPercent = 85;
      if (newHeightPercent < minHeightPercent) newHeightPercent = minHeightPercent;
      if (newHeightPercent > maxHeightPercent) newHeightPercent = maxHeightPercent;

      this.savedPaneHeight.set(newHeightPercent);
    });

    this.unlistenVerticalMouseUp = this.renderer.listen('document', 'mouseup', () => {
      this.stopVerticalResize();
    });
  }

  private stopVerticalResize(): void {
    if (!this.isResizingVertical()) return;
    this.isResizingVertical.set(false);
    if (this.unlistenVerticalMouseMove) {
      this.unlistenVerticalMouseMove();
      this.unlistenVerticalMouseMove = null;
    }
    if (this.unlistenVerticalMouseUp) {
      this.unlistenVerticalMouseUp();
      this.unlistenVerticalMouseUp = null;
    }
    this.uiPreferencesService.setDetailPaneSavedHeight(this.savedPaneHeight());
  }

  ngOnDestroy(): void {
    this.stopResize();
    this.stopVerticalResize();
  }
}