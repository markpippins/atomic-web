// ServiceConfigurationsTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  getServiceConfigurations, 
  createServiceConfiguration, 
  updateServiceConfiguration, 
  deleteServiceConfiguration, 
  toggleServiceConfigurationActive 
} from '../api';

interface ServiceConfiguration {
  id?: number;
  service_id: number;
  config_key: string;
  config_value: string;
  environment: string; // ALL, DEVELOPMENT, PRODUCTION, etc.
  type: string; // STRING, NUMBER, BOOLEAN, URL, DATABASE_URL
  is_secret: boolean;
  description?: string;
  active: boolean;
}

const ServiceConfigurationsTab: React.FC = () => {
  const [configurations, setConfigurations] = useState<ServiceConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfiguration, setEditingConfiguration] = useState<ServiceConfiguration | null>(null);
  const [newConfiguration, setNewConfiguration] = useState<Omit<ServiceConfiguration, 'id'>>({
    service_id: 0,
    config_key: '',
    config_value: '',
    environment: 'ALL',
    type: 'STRING',
    is_secret: false,
    description: '',
    active: true
  });

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const data = await getServiceConfigurations();
      setConfigurations(data);
    } catch (error) {
      console.error('Error loading service configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfiguration = async () => {
    try {
      await createServiceConfiguration(newConfiguration);
      setNewConfiguration({
        service_id: 0,
        config_key: '',
        config_value: '',
        environment: 'ALL',
        type: 'STRING',
        is_secret: false,
        description: '',
        active: true
      });
      loadConfigurations();
    } catch (error) {
      console.error('Error creating service configuration:', error);
    }
  };

  const handleUpdateConfiguration = async () => {
    if (!editingConfiguration || !editingConfiguration.id) return;
    try {
      await updateServiceConfiguration(editingConfiguration.id, editingConfiguration);
      setEditingConfiguration(null);
      loadConfigurations();
    } catch (error) {
      console.error('Error updating service configuration:', error);
    }
  };

  const handleDeleteConfiguration = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service configuration?')) return;
    try {
      await deleteServiceConfiguration(id);
      loadConfigurations();
    } catch (error) {
      console.error('Error deleting service configuration:', error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleServiceConfigurationActive(id);
      loadConfigurations();
    } catch (error) {
      console.error('Error toggling service configuration active status:', error);
    }
  };

  return (
    <div className="service-configurations-tab">
      <div className="controls">
        <h2>Service Configurations</h2>
        <button className="btn btn-primary" onClick={loadConfigurations}>Refresh</button>
      </div>

      {/* Add Configuration Form */}
      <div className="form-section">
        <h3>Add New Configuration</h3>
        <div className="form-grid">
          <input 
            type="number" 
            value={newConfiguration.service_id || ''} 
            onChange={(e) => setNewConfiguration({...newConfiguration, service_id: parseInt(e.target.value) || 0})} 
            placeholder="Service ID" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newConfiguration.config_key} 
            onChange={(e) => setNewConfiguration({...newConfiguration, config_key: e.target.value})} 
            placeholder="Config Key" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newConfiguration.config_value} 
            onChange={(e) => setNewConfiguration({...newConfiguration, config_value: e.target.value})} 
            placeholder="Config Value" 
            className="form-control"
          />
          <select 
            value={newConfiguration.environment} 
            onChange={(e) => setNewConfiguration({...newConfiguration, environment: e.target.value})} 
            className="form-control"
          >
            <option value="ALL">All</option>
            <option value="DEVELOPMENT">Development</option>
            <option value="STAGING">Staging</option>
            <option value="PRODUCTION">Production</option>
          </select>
          <select 
            value={newConfiguration.type} 
            onChange={(e) => setNewConfiguration({...newConfiguration, type: e.target.value})} 
            className="form-control"
          >
            <option value="STRING">String</option>
            <option value="NUMBER">Number</option>
            <option value="BOOLEAN">Boolean</option>
            <option value="URL">URL</option>
            <option value="DATABASE_URL">Database URL</option>
          </select>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={newConfiguration.is_secret} 
              onChange={(e) => setNewConfiguration({...newConfiguration, is_secret: e.target.checked})} 
            /> 
            Is Secret
          </label>
          <input 
            type="text" 
            value={newConfiguration.description} 
            onChange={(e) => setNewConfiguration({...newConfiguration, description: e.target.value})} 
            placeholder="Description" 
            className="form-control"
          />
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={newConfiguration.active} 
              onChange={(e) => setNewConfiguration({...newConfiguration, active: e.target.checked})} 
            /> 
            Active
          </label>
          <button className="btn btn-success" onClick={handleCreateConfiguration}>Add Configuration</button>
        </div>
      </div>

      {/* Configurations List */}
      <div className="data-section">
        <h3>Configuration List</h3>
        {loading ? (
          <p>Loading configurations...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Service ID</th>
                <th>Config Key</th>
                <th>Config Value</th>
                <th>Environment</th>
                <th>Type</th>
                <th>Is Secret</th>
                <th>Description</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {configurations.map((configuration) => (
                <tr key={configuration.id}>
                  {editingConfiguration && editingConfiguration.id === configuration.id ? (
                    <>
                      <td>
                        <input 
                          type="number" 
                          value={editingConfiguration.service_id || ''} 
                          onChange={(e) => setEditingConfiguration({...editingConfiguration, service_id: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingConfiguration.config_key} 
                          onChange={(e) => setEditingConfiguration({...editingConfiguration, config_key: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingConfiguration.config_value} 
                          onChange={(e) => setEditingConfiguration({...editingConfiguration, config_value: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select 
                          value={editingConfiguration.environment} 
                          onChange={(e) => setEditingConfiguration({...editingConfiguration, environment: e.target.value})} 
                          className="form-control"
                        >
                          <option value="ALL">All</option>
                          <option value="DEVELOPMENT">Development</option>
                          <option value="STAGING">Staging</option>
                          <option value="PRODUCTION">Production</option>
                        </select>
                      </td>
                      <td>
                        <select 
                          value={editingConfiguration.type} 
                          onChange={(e) => setEditingConfiguration({...editingConfiguration, type: e.target.value})} 
                          className="form-control"
                        >
                          <option value="STRING">String</option>
                          <option value="NUMBER">Number</option>
                          <option value="BOOLEAN">Boolean</option>
                          <option value="URL">URL</option>
                          <option value="DATABASE_URL">Database URL</option>
                        </select>
                      </td>
                      <td>
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={editingConfiguration.is_secret} 
                            onChange={(e) => setEditingConfiguration({...editingConfiguration, is_secret: e.target.checked})} 
                          />
                        </label>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingConfiguration.description} 
                          onChange={(e) => setEditingConfiguration({...editingConfiguration, description: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={editingConfiguration.active} 
                            onChange={(e) => setEditingConfiguration({...editingConfiguration, active: e.target.checked})} 
                          />
                        </label>
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm" onClick={handleUpdateConfiguration}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingConfiguration(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{configuration.service_id}</td>
                      <td>{configuration.config_key}</td>
                      <td>{configuration.config_value}</td>
                      <td>{configuration.environment}</td>
                      <td>{configuration.type}</td>
                      <td>{configuration.is_secret ? 'Yes' : 'No'}</td>
                      <td>{configuration.description}</td>
                      <td>
                        <span className={`status-badge ${configuration.active ? 'active' : 'inactive'}`}>
                          {configuration.active ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          className={`btn btn-sm ${configuration.active ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActive(configuration.id!)}
                        >
                          {configuration.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => setEditingConfiguration(configuration)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => configuration.id !== undefined && handleDeleteConfiguration(configuration.id)}
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

export default ServiceConfigurationsTab;