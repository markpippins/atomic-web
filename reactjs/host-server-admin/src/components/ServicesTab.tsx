// ServicesTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  getServices, 
  createService, 
  updateService, 
  deleteService, 
  toggleServiceActive 
} from '../api';

interface Service {
  id?: number;
  name: string;
  description?: string;
  framework_id: number;
  type: string; // REST_API, GATEWAY, etc.
  default_port?: number;
  api_base_path?: string;
  repository_url?: string;
  version?: string;
  status: string; // ACTIVE, DEPRECATED, ARCHIVED, PLANNED
  active: boolean;
}

const ServicesTab: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    name: '',
    description: '',
    framework_id: 0,
    type: '',
    default_port: 0,
    api_base_path: '',
    repository_url: '',
    version: '',
    status: 'PLANNED',
    active: true
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    try {
      await createService(newService);
      setNewService({
        name: '',
        description: '',
        framework_id: 0,
        type: '',
        default_port: 0,
        api_base_path: '',
        repository_url: '',
        version: '',
        status: 'PLANNED',
        active: true
      });
      loadServices();
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const handleUpdateService = async () => {
    if (!editingService || !editingService.id) return;
    try {
      await updateService(editingService.id, editingService);
      setEditingService(null);
      loadServices();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteService(id);
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleServiceActive(id);
      loadServices();
    } catch (error) {
      console.error('Error toggling service active status:', error);
    }
  };

  return (
    <div className="services-tab">
      <div className="controls">
        <h2>Services</h2>
        <button className="btn btn-primary" onClick={loadServices}>Refresh</button>
      </div>

      {/* Add Service Form */}
      <div className="form-section">
        <h3>Add New Service</h3>
        <div className="form-grid">
          <input 
            type="text" 
            value={newService.name} 
            onChange={(e) => setNewService({...newService, name: e.target.value})} 
            placeholder="Name" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newService.description} 
            onChange={(e) => setNewService({...newService, description: e.target.value})} 
            placeholder="Description" 
            className="form-control"
          />
          <input 
            type="number" 
            value={newService.framework_id || ''} 
            onChange={(e) => setNewService({...newService, framework_id: parseInt(e.target.value) || 0})} 
            placeholder="Framework ID" 
            className="form-control"
          />
          <select 
            value={newService.type} 
            onChange={(e) => setNewService({...newService, type: e.target.value})} 
            className="form-control"
          >
            <option value="">Select Type</option>
            <option value="REST_API">REST API</option>
            <option value="GATEWAY">Gateway</option>
            <option value="MESSAGE_QUEUE">Message Queue</option>
            <option value="DATABASE">Database</option>
          </select>
          <input 
            type="number" 
            value={newService.default_port || ''} 
            onChange={(e) => setNewService({...newService, default_port: parseInt(e.target.value) || 0})} 
            placeholder="Default Port" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newService.api_base_path} 
            onChange={(e) => setNewService({...newService, api_base_path: e.target.value})} 
            placeholder="API Base Path" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newService.repository_url} 
            onChange={(e) => setNewService({...newService, repository_url: e.target.value})} 
            placeholder="Repository URL" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newService.version} 
            onChange={(e) => setNewService({...newService, version: e.target.value})} 
            placeholder="Version" 
            className="form-control"
          />
          <select 
            value={newService.status} 
            onChange={(e) => setNewService({...newService, status: e.target.value})} 
            className="form-control"
          >
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="DEPRECATED">Deprecated</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={newService.active} 
              onChange={(e) => setNewService({...newService, active: e.target.checked})} 
            /> 
            Active
          </label>
          <button className="btn btn-success" onClick={handleCreateService}>Add Service</button>
        </div>
      </div>

      {/* Services List */}
      <div className="data-section">
        <h3>Service List</h3>
        {loading ? (
          <p>Loading services...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Framework ID</th>
                <th>Type</th>
                <th>Default Port</th>
                <th>API Base Path</th>
                <th>Repository URL</th>
                <th>Version</th>
                <th>Status</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  {editingService && editingService.id === service.id ? (
                    <>
                      <td>
                        <input 
                          type="text" 
                          value={editingService.name} 
                          onChange={(e) => setEditingService({...editingService, name: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingService.description} 
                          onChange={(e) => setEditingService({...editingService, description: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editingService.framework_id || ''} 
                          onChange={(e) => setEditingService({...editingService, framework_id: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select 
                          value={editingService.type} 
                          onChange={(e) => setEditingService({...editingService, type: e.target.value})} 
                          className="form-control"
                        >
                          <option value="REST_API">REST API</option>
                          <option value="GATEWAY">Gateway</option>
                          <option value="MESSAGE_QUEUE">Message Queue</option>
                          <option value="DATABASE">Database</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editingService.default_port || ''} 
                          onChange={(e) => setEditingService({...editingService, default_port: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingService.api_base_path} 
                          onChange={(e) => setEditingService({...editingService, api_base_path: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingService.repository_url} 
                          onChange={(e) => setEditingService({...editingService, repository_url: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingService.version} 
                          onChange={(e) => setEditingService({...editingService, version: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select 
                          value={editingService.status} 
                          onChange={(e) => setEditingService({...editingService, status: e.target.value})} 
                          className="form-control"
                        >
                          <option value="PLANNED">Planned</option>
                          <option value="ACTIVE">Active</option>
                          <option value="DEPRECATED">Deprecated</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </td>
                      <td>
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={editingService.active} 
                            onChange={(e) => setEditingService({...editingService, active: e.target.checked})} 
                          />
                        </label>
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm" onClick={handleUpdateService}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingService(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{service.name}</td>
                      <td>{service.description}</td>
                      <td>{service.framework_id}</td>
                      <td>{service.type}</td>
                      <td>{service.default_port}</td>
                      <td>{service.api_base_path}</td>
                      <td>{service.repository_url}</td>
                      <td>{service.version}</td>
                      <td>{service.status}</td>
                      <td>
                        <span className={`status-badge ${service.active ? 'active' : 'inactive'}`}>
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          className={`btn btn-sm ${service.active ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActive(service.id!)}
                        >
                          {service.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => setEditingService(service)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => service.id !== undefined && handleDeleteService(service.id)}
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

export default ServicesTab;