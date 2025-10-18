export type FileType = 'folder' | 'file';

export interface FileSystemNode {
  name: string;
  type: FileType;
  children?: FileSystemNode[];
  content?: string; // for files
  modified?: string; // for display
  childrenLoaded?: boolean;
}

export interface SearchResultNode extends FileSystemNode {
  path: string[];
}