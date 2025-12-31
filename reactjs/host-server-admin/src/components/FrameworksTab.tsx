// FrameworksTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  getFrameworks, 
  createFramework, 
  updateFramework, 
  deleteFramework, 
  toggleFrameworkActive 
} from '../api';

interface Framework {
  id?: number;
  name: string;
  description: string;
  category: string;
  language: string;
  version?: string;
  url?: string;
  supports_broker: boolean;
  active: boolean;
}

const FrameworksTab: React.FC = () => {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFramework, setEditingFramework] = useState<Framework | null>(null);
  const [newFramework, setNewFramework] = useState<Omit<Framework, 'id'>>({
    name: '',
    description: '',
    category: '',
    language: '',
    version: '',
    url: '',
    supports_broker: false,
    active: true
  });

  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = async () => {
    try {
      setLoading(true);
      const data = await getFrameworks();
      setFrameworks(data);
    } catch (error) {
      console.error('Error loading frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFramework = async () => {
    try {
      await createFramework(newFramework);
      setNewFramework({
        name: '',
        description: '',
        category: '',
        language: '',
        version: '',
        url: '',
        supports_broker: false,
        active: true
      });
      loadFrameworks();
    } catch (error) {
      console.error('Error creating framework:', error);
    }
  };

  const handleUpdateFramework = async () => {
    if (!editingFramework || !editingFramework.id) return;
    try {
      await updateFramework(editingFramework.id, editingFramework);
      setEditingFramework(null);
      loadFrameworks();
    } catch (error) {
      console.error('Error updating framework:', error);
    }
  };

  const handleDeleteFramework = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this framework?')) return;
    try {
      await deleteFramework(id);
      loadFrameworks();
    } catch (error) {
      console.error('Error deleting framework:', error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleFrameworkActive(id);
      loadFrameworks();
    } catch (error) {
      console.error('Error toggling framework active status:', error);
    }
  };

  return (
    <div className="frameworks-tab">
      <div className="controls">
        <h2>Frameworks</h2>
        <button className="btn btn-primary" onClick={loadFrameworks}>Refresh</button>
      </div>

      {/* Add Framework Form */}
      <div className="form-section">
        <h3>Add New Framework</h3>
        <div className="form-grid">
          <input 
            type="text" 
            value={newFramework.name} 
            onChange={(e) => setNewFramework({...newFramework, name: e.target.value})} 
            placeholder="Name" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newFramework.description} 
            onChange={(e) => setNewFramework({...newFramework, description: e.target.value})} 
            placeholder="Description" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newFramework.category} 
            onChange={(e) => setNewFramework({...newFramework, category: e.target.value})} 
            placeholder="Category" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newFramework.language} 
            onChange={(e) => setNewFramework({...newFramework, language: e.target.value})} 
            placeholder="Language" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newFramework.version} 
            onChange={(e) => setNewFramework({...newFramework, version: e.target.value})} 
            placeholder="Version" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newFramework.url} 
            onChange={(e) => setNewFramework({...newFramework, url: e.target.value})} 
            placeholder="URL" 
            className="form-control"
          />
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={newFramework.supports_broker} 
              onChange={(e) => setNewFramework({...newFramework, supports_broker: e.target.checked})} 
            /> 
            Supports Broker
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={newFramework.active} 
              onChange={(e) => setNewFramework({...newFramework, active: e.target.checked})} 
            /> 
            Active
          </label>
          <button className="btn btn-success" onClick={handleCreateFramework}>Add Framework</button>
        </div>
      </div>

      {/* Frameworks List */}
      <div className="data-section">
        <h3>Framework List</h3>
        {loading ? (
          <p>Loading frameworks...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Language</th>
                <th>Version</th>
                <th>URL</th>
                <th>Supports Broker</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {frameworks.map((framework) => (
                <tr key={framework.id}>
                  {editingFramework && editingFramework.id === framework.id ? (
                    <>
                      <td>
                        <input 
                          type="text" 
                          value={editingFramework.name} 
                          onChange={(e) => setEditingFramework({...editingFramework, name: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingFramework.description} 
                          onChange={(e) => setEditingFramework({...editingFramework, description: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingFramework.category} 
                          onChange={(e) => setEditingFramework({...editingFramework, category: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingFramework.language} 
                          onChange={(e) => setEditingFramework({...editingFramework, language: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingFramework.version} 
                          onChange={(e) => setEditingFramework({...editingFramework, version: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingFramework.url} 
                          onChange={(e) => setEditingFramework({...editingFramework, url: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={editingFramework.supports_broker} 
                            onChange={(e) => setEditingFramework({...editingFramework, supports_broker: e.target.checked})} 
                          />
                        </label>
                      </td>
                      <td>
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={editingFramework.active} 
                            onChange={(e) => setEditingFramework({...editingFramework, active: e.target.checked})} 
                          />
                        </label>
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm" onClick={handleUpdateFramework}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingFramework(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{framework.name}</td>
                      <td>{framework.description}</td>
                      <td>{framework.category}</td>
                      <td>{framework.language}</td>
                      <td>{framework.version}</td>
                      <td>{framework.url}</td>
                      <td>{framework.supports_broker ? 'Yes' : 'No'}</td>
                      <td>
                        <span className={`status-badge ${framework.active ? 'active' : 'inactive'}`}>
                          {framework.active ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          className={`btn btn-sm ${framework.active ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActive(framework.id!)}
                        >
                          {framework.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => setEditingFramework(framework)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => framework.id !== undefined && handleDeleteFramework(framework.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FrameworksTab;