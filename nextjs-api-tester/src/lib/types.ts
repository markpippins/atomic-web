export interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
}

export type Operation = 'ls' | 'cd' | 'mkdir' | 'rmdir' | 'newfile' | 'deletefile' | 'rename';

export interface ApiRequest {
  alias: string;
  path: string[];
  operation: Operation;
  filename?: string;
  new_name?: string;
}

export interface ApiResponse {
    path?: string[];
    items?: FileSystemItem[];
    status?: string;
    message?: string;
    error?: string;
}
