// ImportExportTab.tsx
import React, { useState } from 'react';
import { importData, exportData } from '../api';

const ImportExportTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportType, setExportType] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setMessage('Please select a file to import');
      return;
    }

    setLoading(true);
    setMessage('Importing data...');

    try {
      const fileContent = await readFile(selectedFile);
      const data = JSON.parse(fileContent);
      
      await importData(data);
      setMessage('Data imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      setMessage('Error importing data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage('Exporting data...');

    try {
      const data = await exportData(exportType === 'active');
      
      // Create and download the JSON file
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `host-server-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Error exporting data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  return (
    <div className="import-export-tab">
      <div className="controls">
        <h2>Import/Export Data</h2>
      </div>

      <div className="section">
        <h3>Import Data</h3>
        <div className="form-section">
          <div className="form-grid">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileChange} 
              className="form-control"
            />
            <button 
              className="btn btn-primary" 
              onClick={handleImport} 
              disabled={loading}
            >
              Import Data
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Export Data</h3>
        <div className="form-section">
          <div className="form-grid">
            <select 
              value={exportType} 
              onChange={(e) => setExportType(e.target.value)} 
              className="form-control"
            >
              <option value="all">All Data</option>
              <option value="active">Active Only</option>
            </select>
            
            {exportType !== 'all' && exportType !== 'active' && (
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={activeOnly} 
                  onChange={(e) => setActiveOnly(e.target.checked)} 
                /> 
                Active Only
              </label>
            )}
            
            <button 
              className="btn btn-success" 
              onClick={handleExport} 
              disabled={loading}
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message-section ${message.includes('Error') ? 'error' : ''}`}>
          <div className="message">
            {message}
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">
          Processing...
        </div>
      )}
    </div>
  );
};

export default ImportExportTab;