// DeploymentsTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  getDeployments, 
  createDeployment, 
  updateDeployment, 
  deleteDeployment, 
  toggleDeploymentActive 
} from '../api';

interface Deployment {
  id?: number;
  service_id: number;
  server_id: number;
  port: number;
  version?: string;
  status?: string; // RUNNING, STOPPED, FAILED, etc.
  environment: string; // DEVELOPMENT, STAGING, PRODUCTION
  health_check_url?: string;
  health_status?: string; // HEALTHY, UNHEALTHY, DEGRADED
  deployment_path?: string;
  started_at?: string; // timestamp
  last_health_check?: string; // timestamp
  active: boolean;
}

const DeploymentsTab: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);
  const [newDeployment, setNewDeployment] = useState<Omit<Deployment, 'id'>>({
    service_id: 0,
    server_id: 0,
    port: 0,
    version: '',
    status: '',
    environment: '',
    health_check_url: '',
    health_status: '',
    deployment_path: '',
    started_at: '',
    last_health_check: '',
    active: true
  });

  useEffect(() => {
    loadDeployments();
  }, []);

  const loadDeployments = async () => {
    try {
      setLoading(true);
      const data = await getDeployments();
      setDeployments(data);
    } catch (error) {
      console.error('Error loading deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeployment = async () => {
    try {
      await createDeployment(newDeployment);
      setNewDeployment({
        service_id: 0,
        server_id: 0,
        port: 0,
        version: '',
        status: '',
        environment: '',
        health_check_url: '',
        health_status: '',
        deployment_path: '',
        started_at: '',
        last_health_check: '',
        active: true
      });
      loadDeployments();
    } catch (error) {
      console.error('Error creating deployment:', error);
    }
  };

  const handleUpdateDeployment = async () => {
    if (!editingDeployment || !editingDeployment.id) return;
    try {
      await updateDeployment(editingDeployment.id, editingDeployment);
      setEditingDeployment(null);
      loadDeployments();
    } catch (error) {
      console.error('Error updating deployment:', error);
    }
  };

  const handleDeleteDeployment = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this deployment?')) return;
    try {
      await deleteDeployment(id);
      loadDeployments();
    } catch (error) {
      console.error('Error deleting deployment:', error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleDeploymentActive(id);
      loadDeployments();
    } catch (error) {
      console.error('Error toggling deployment active status:', error);
    }
  };

  return (
    <div className="deployments-tab">
      <div className="controls">
        <h2>Deployments</h2>
        <button className="btn btn-primary" onClick={loadDeployments}>Refresh</button>
      </div>

      {/* Add Deployment Form */}
      <div className="form-section">
        <h3>Add New Deployment</h3>
        <div className="form-grid">
          <input 
            type="number" 
            value={newDeployment.service_id || ''} 
            onChange={(e) => setNewDeployment({...newDeployment, service_id: parseInt(e.target.value) || 0})} 
            placeholder="Service ID" 
            className="form-control"
          />
          <input 
            type="number" 
            value={newDeployment.server_id || ''} 
            onChange={(e) => setNewDeployment({...newDeployment, server_id: parseInt(e.target.value) || 0})} 
            placeholder="Server ID" 
            className="form-control"
          />
          <input 
            type="number" 
            value={newDeployment.port || ''} 
            onChange={(e) => setNewDeployment({...newDeployment, port: parseInt(e.target.value) || 0})} 
            placeholder="Port" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newDeployment.version} 
            onChange={(e) => setNewDeployment({...newDeployment, version: e.target.value})} 
            placeholder="Version" 
            className="form-control"
          />
          <select 
            value={newDeployment.status || ''} 
            onChange={(e) => setNewDeployment({...newDeployment, status: e.target.value})} 
            className="form-control"
          >
            <option value="">Select Status</option>
            <option value="RUNNING">Running</option>
            <option value="STOPPED">Stopped</option>
            <option value="FAILED">Failed</option>
          </select>
          <select 
            value={newDeployment.environment} 
            onChange={(e) => setNewDeployment({...newDeployment, environment: e.target.value})} 
            className="form-control"
          >
            <option value="">Select Environment</option>
            <option value="DEVELOPMENT">Development</option>
            <option value="STAGING">Staging</option>
            <option value="PRODUCTION">Production</option>
          </select>
          <input 
            type="text" 
            value={newDeployment.health_check_url} 
            onChange={(e) => setNewDeployment({...newDeployment, health_check_url: e.target.value})} 
            placeholder="Health Check URL" 
            className="form-control"
          />
          <select 
            value={newDeployment.health_status || ''} 
            onChange={(e) => setNewDeployment({...newDeployment, health_status: e.target.value})} 
            className="form-control"
          >
            <option value="">Select Health Status</option>
            <option value="HEALTHY">Healthy</option>
            <option value="UNHEALTHY">Unhealthy</option>
            <option value="DEGRADED">Degraded</option>
          </select>
          <input 
            type="text" 
            value={newDeployment.deployment_path} 
            onChange={(e) => setNewDeployment({...newDeployment, deployment_path: e.target.value})} 
            placeholder="Deployment Path" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newDeployment.started_at} 
            onChange={(e) => setNewDeployment({...newDeployment, started_at: e.target.value})} 
            placeholder="Started At (ISO)" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newDeployment.last_health_check} 
            onChange={(e) => setNewDeployment({...newDeployment, last_health_check: e.target.value})} 
            placeholder="Last Health Check (ISO)" 
            className="form-control"
          />
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={newDeployment.active} 
              onChange={(e) => setNewDeployment({...newDeployment, active: e.target.checked})} 
            /> 
            Active
          </label>
          <button className="btn btn-success" onClick={handleCreateDeployment}>Add Deployment</button>
        </div>
      </div>

      {/* Deployments List */}
      <div className="data-section">
        <h3>Deployment List</h3>
        {loading ? (
          <p>Loading deployments...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Service ID</th>
                <th>Server ID</th>
                <th>Port</th>
                <th>Version</th>
                <th>Status</th>
                <th>Environment</th>
                <th>Health Check URL</th>
                <th>Health Status</th>
                <th>Deployment Path</th>
                <th>Started At</th>
                <th>Last Health Check</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((deployment) => (
                <tr key={deployment.id}>
                  {editingDeployment && editingDeployment.id === deployment.id ? (
                    <>
                      <td>
                        <input 
                          type="number" 
                          value={editingDeployment.service_id || ''} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, service_id: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editingDeployment.server_id || ''} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, server_id: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editingDeployment.port || ''} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, port: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingDeployment.version} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, version: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select 
                          value={editingDeployment.status || ''} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, status: e.target.value})} 
                          className="form-control"
                        >
                          <option value="">Select Status</option>
                          <option value="RUNNING">Running</option>
                          <option value="STOPPED">Stopped</option>
                          <option value="FAILED">Failed</option>
                        </select>
                      </td>
                      <td>
                        <select 
                          value={editingDeployment.environment} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, environment: e.target.value})} 
                          className="form-control"
                        >
                          <option value="">Select Environment</option>
                          <option value="DEVELOPMENT">Development</option>
                          <option value="STAGING">Staging</option>
                          <option value="PRODUCTION">Production</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingDeployment.health_check_url} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, health_check_url: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select 
                          value={editingDeployment.health_status || ''} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, health_status: e.target.value})} 
                          className="form-control"
                        >
                          <option value="">Select Health Status</option>
                          <option value="HEALTHY">Healthy</option>
                          <option value="UNHEALTHY">Unhealthy</option>
                          <option value="DEGRADED">Degraded</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingDeployment.deployment_path} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, deployment_path: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingDeployment.started_at} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, started_at: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingDeployment.last_health_check} 
                          onChange={(e) => setEditingDeployment({...editingDeployment, last_health_check: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={editingDeployment.active} 
                            onChange={(e) => setEditingDeployment({...editingDeployment, active: e.target.checked})} 
                          />
                        </label>
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm" onClick={handleUpdateDeployment}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingDeployment(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{deployment.service_id}</td>
                      <td>{deployment.server_id}</td>
                      <td>{deployment.port}</td>
                      <td>{deployment.version}</td>
                      <td>{deployment.status}</td>
                      <td>{deployment.environment}</td>
                      <td>{deployment.health_check_url}</td>
                      <td>{deployment.health_status}</td>
                      <td>{deployment.deployment_path}</td>
                      <td>{deployment.started_at}</td>
                      <td>{deployment.last_health_check}</td>
                      <td>
                        <span className={`status-badge ${deployment.active ? 'active' : 'inactive'}`}>
                          {deployment.active ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          className={`btn btn-sm ${deployment.active ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActive(deployment.id!)}
                        >
                          {deployment.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => setEditingDeployment(deployment)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => deployment.id !== undefined && handleDeleteDeployment(deployment.id)}
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

export default DeploymentsTab;