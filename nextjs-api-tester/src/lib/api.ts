import type { ApiRequest, ApiResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/fs';

async function callApi(payload: ApiRequest): Promise<ApiResponse> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
      throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred' };
  }
}

export const listDirectory = (alias: string, path: string[]): Promise<ApiResponse> => 
  callApi({ alias, path, operation: 'ls' });

export const createDirectory = (alias: string, path: string[], newDirName: string): Promise<ApiResponse> => 
  callApi({ alias, path, operation: 'mkdir', filename: newDirName });

export const createFile = (alias: string, path: string[], newFileName: string): Promise<ApiResponse> => 
  callApi({ alias, path, operation: 'newfile', filename: newFileName });

export const deleteItem = (alias: string, path: string[], name: string, type: 'file' | 'directory'): Promise<ApiResponse> => {
  const operation = type === 'file' ? 'deletefile' : 'rmdir';
  return callApi({ alias, path, operation, filename: name });
};

export const renameItem = (alias: string, path: string[], oldName: string, newName: string): Promise<ApiResponse> => 
  callApi({ alias, path, operation: 'rename', filename: oldName, new_name: newName });
