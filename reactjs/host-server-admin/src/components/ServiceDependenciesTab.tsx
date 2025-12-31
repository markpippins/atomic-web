// ServiceDependenciesTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  getServiceDependencies, 
  createServiceDependency, 
  updateServiceDependency, 
  deleteServiceDependency, 
  toggleServiceDependencyActive 
} from '../api';

interface ServiceDependency {
  id?: number;
  source_service_id: number;
  target_service_id: number;
  dependency_type: string; // REQUIRED, OPTIONAL
  active: boolean;
}

const ServiceDependenciesTab: React.FC = () => {
  const [dependencies, setDependencies] = useState<ServiceDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDependency, setEditingDependency] = useState<ServiceDependency | null>(null);
  const [newDependency, setNewDependency] = useState<Omit<ServiceDependency, 'id'>>({
    source_service_id: 0,
    target_service_id: 0,
    dependency_type: 'REQUIRED',
    active: true
  });

  useEffect(() => {
    loadDependencies();
  }, []);

  const loadDependencies = async () => {
    try {
      setLoading(true);
      const data = await getServiceDependencies();
      setDependencies(data);
    } catch (error) {
      console.error('Error loading service dependencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDependency = async () => {
    try {
      await createServiceDependency(newDependency);
      setNewDependency({
        source_service_id: 0,
        target_service_id: 0,
        dependency_type: 'REQUIRED',
        active: true
      });
      loadDependencies();
    } catch (error) {
      console.error('Error creating service dependency:', error);
    }
  };

  const handleUpdateDependency = async () => {
    if (!editingDependency || !editingDependency.id) return;
    try {
      await updateServiceDependency(editingDependency.id, editingDependency);
      setEditingDependency(null);
      loadDependencies();
    } catch (error) {
      console.error('Error updating service dependency:', error);
    }
  };

  const handleDeleteDependency = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service dependency?')) return;
    try {
      await deleteServiceDependency(id);
      loadDependencies();
    } catch (error) {
      console.error('Error deleting service dependency:', error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleServiceDependencyActive(id);
      loadDependencies();
    } catch (error) {
      console.error('Error toggling service dependency active status:', error);
    }
  };

  return (
    <div className="service-dependencies-tab">
      <div className="controls">
        <h2>Service Dependencies</h2>
        <button className="btn btn-primary" onClick={loadDependencies}>Refresh</button>
      </div>

      {/* Add Dependency Form */}
      <div className="form-section">
        <h3>Add New Dependency</h3>
        <div className="form-grid">
          <input 
            type="number" 
            value={newDependency.source_service_id || ''} 
            onChange={(e) => setNewDependency({...newDependency, source_service_id: parseInt(e.target.value) || 0})} 
            placeholder="Source Service ID" 
            className="form-control"
          />
          <input 
            type="number" 
            value={newDependency.target_service_id || ''} 
            onChange={(e) => setNewDependency({...newDependency, target_service_id: parseInt(e.target.value) || 0})} 
            placeholder="Target Service ID" 
            className="form-control"
          />
          <select 
            value={newDependency.dependency_type} 
            onChange={(e) => setNewDependency({...newDependency, dependency_type: e.target.value})} 
            className="form-control"
          >
            <option value="REQUIRED">Required</option>
            <option value="OPTIONAL">Optional</option>
          </select>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={newDependency.active} 
              onChange={(e) => setNewDependency({...newDependency, active: e.target.checked})} 
            /> 
            Active
          </label>
          <button className="btn btn-success" onClick={handleCreateDependency}>Add Dependency</button>
        </div>
      </div>

      {/* Dependencies List */}
      <div className="data-section">
        <h3>Dependency List</h3>
        {loading ? (
          <p>Loading dependencies...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Source Service ID</th>
                <th>Target Service ID</th>
                <th>Dependency Type</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dependency) => (
                <tr key={dependency.id}>
                  {editingDependency && editingDependency.id === dependency.id ? (
                    <>
                      <td>
                        <input 
                          type="number" 
                          value={editingDependency.source_service_id || ''} 
                          onChange={(e) => setEditingDependency({...editingDependency, source_service_id: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editingDependency.target_service_id || ''} 
                          onChange={(e) => setEditingDependency({...editingDependency, target_service_id: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select 
                          value={editingDependency.dependency_type} 
                          onChange={(e) => setEditingDependency({...editingDependency, dependency_type: e.target.value})} 
                          className="form-control"
                        >
                          <option value="REQUIRED">Required</option>
                          <option value="OPTIONAL">Optional</option>
                        </select>
                      </td>
                      <td>
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={editingDependency.active} 
                            onChange={(e) => setEditingDependency({...editingDependency, active: e.target.checked})} 
                          />
                        </label>
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm" onClick={handleUpdateDependency}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingDependency(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{dependency.source_service_id}</td>
                      <td>{dependency.target_service_id}</td>
                      <td>{dependency.dependency_type}</td>
                      <td>
                        <span className={`status-badge ${dependency.active ? 'active' : 'inactive'}`}>
                          {dependency.active ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          className={`btn btn-sm ${dependency.active ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActive(dependency.id!)}
                        >
                          {dependency.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => setEditingDependency(dependency)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => dependency.id !== undefined && handleDeleteDependency(dependency.id)}
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

export default ServiceDependenciesTab;