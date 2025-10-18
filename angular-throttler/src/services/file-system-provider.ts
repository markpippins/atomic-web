import { FileSystemNode, FileType, SearchResultNode } from '../models/file-system.model';

export interface ItemReference {
  name: string;
  type: FileType;
}

export abstract class FileSystemProvider {
  abstract getContents(path: string[]): Promise<FileSystemNode[]>;
  abstract getFileContent(path: string[], name: string): Promise<string>;
  abstract getFolderTree(): Promise<FileSystemNode>;
  abstract createDirectory(path: string[], name: string): Promise<void>;
  abstract removeDirectory(path: string[], name: string): Promise<void>;
  abstract createFile(path: string[], name: string): Promise<void>;
  abstract deleteFile(path: string[], name: string): Promise<void>;
  abstract rename(path: string[], oldName: string, newName: string): Promise<void>;
  abstract uploadFile(path: string[], file: File): Promise<void>;
  abstract move(sourcePath: string[], destPath: string[], items: ItemReference[]): Promise<void>;
  abstract copy(sourcePath: string[], destPath: string[], items: ItemReference[]): Promise<void>;
  abstract search(query: string): Promise<SearchResultNode[]>;
}
