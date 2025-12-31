// ServersTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  getServers, 
  createServer, 
  updateServer, 
  deleteServer, 
  toggleServerActive 
} from '../api';

interface Server {
  id?: number;
  hostname: string;
  ip_address: string;
  type: string; // PHYSICAL, VIRTUAL, CONTAINER, CLOUD
  environment: string; // DEVELOPMENT, STAGING, PRODUCTION
  operating_system?: string;
  cpu_cores?: number;
  memory_mb?: number;
  disk_gb?: number;
  status: string; // ACTIVE, INACTIVE, MAINTENANCE
  description?: string;
  active: boolean;
}

const ServersTab: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [newServer, setNewServer] = useState<Omit<Server, 'id'>>({
    hostname: '',
    ip_address: '',
    type: '',
    environment: '',
    operating_system: '',
    cpu_cores: 0,
    memory_mb: 0,
    disk_gb: 0,
    status: 'ACTIVE',
    description: '',
    active: true
  });

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const data = await getServers();
      setServers(data);
    } catch (error) {
      console.error('Error loading servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateServer = async () => {
    try {
      await createServer(newServer);
      setNewServer({
        hostname: '',
        ip_address: '',
        type: '',
        environment: '',
        operating_system: '',
        cpu_cores: 0,
        memory_mb: 0,
        disk_gb: 0,
        status: 'ACTIVE',
        description: '',
        active: true
      });
      loadServers();
    } catch (error) {
      console.error('Error creating server:', error);
    }
  };

  const handleUpdateServer = async () => {
    if (!editingServer || !editingServer.id) return;
    try {
      await updateServer(editingServer.id, editingServer);
      setEditingServer(null);
      loadServers();
    } catch (error) {
      console.error('Error updating server:', error);
    }
  };

  const handleDeleteServer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this server?')) return;
    try {
      await deleteServer(id);
      loadServers();
    } catch (error) {
      console.error('Error deleting server:', error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleServerActive(id);
      loadServers();
    } catch (error) {
      console.error('Error toggling server active status:', error);
    }
  };

  return (
    <div className="servers-tab">
      <div className="controls">
        <h2>Servers</h2>
        <button className="btn btn-primary" onClick={loadServers}>Refresh</button>
      </div>

      {/* Add Server Form */}
      <div className="form-section">
        <h3>Add New Server</h3>
        <div className="form-grid">
          <input 
            type="text" 
            value={newServer.hostname} 
            onChange={(e) => setNewServer({...newServer, hostname: e.target.value})} 
            placeholder="Hostname" 
            className="form-control"
          />
          <input 
            type="text" 
            value={newServer.ip_address} 
            onChange={(e) => setNewServer({...newServer, ip_address: e.target.value})} 
            placeholder="IP Address" 
            className="form-control"
          />
          <select 
            value={newServer.type} 
            onChange={(e) => setNewServer({...newServer, type: e.target.value})} 
            className="form-control"
          >
            <option value="">Select Type</option>
            <option value="PHYSICAL">Physical</option>
            <option value="VIRTUAL">Virtual</option>
            <option value="CONTAINER">Container</option>
            <option value="CLOUD">Cloud</option>
          </select>
          <select 
            value={newServer.environment} 
            onChange={(e) => setNewServer({...newServer, environment: e.target.value})} 
            className="form-control"
          >
            <option value="">Select Environment</option>
            <option value="DEVELOPMENT">Development</option>
            <option value="STAGING">Staging</option>
            <option value="PRODUCTION">Production</option>
          </select>
          <input 
            type="text" 
            value={newServer.operating_system} 
            onChange={(e) => setNewServer({...newServer, operating_system: e.target.value})} 
            placeholder="Operating System" 
            className="form-control"
          />
          <input 
            type="number" 
            value={newServer.cpu_cores || ''} 
            onChange={(e) => setNewServer({...newServer, cpu_cores: parseInt(e.target.value) || 0})} 
            placeholder="CPU Cores" 
            className="form-control"
          />
          <input 
            type="number" 
            value={newServer.memory_mb || ''} 
            onChange={(e) => setNewServer({...newServer, memory_mb: parseInt(e.target.value) || 0})} 
            placeholder="Memory (MB)" 
            className="form-control"
          />
          <input 
            type="number" 
            value={newServer.disk_gb || ''} 
            onChange={(e) => setNewServer({...newServer, disk_gb: parseInt(e.target.value) || 0})} 
            placeholder="Disk (GB)" 
            className="form-control"
          />
          <select 
            value={newServer.status} 
            onChange={(e) => setNewServer({...newServer, status: e.target.value})} 
            className="form-control"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <input 
            type="text" 
            value={newServer.description} 
            onChange={(e) => setNewServer({...newServer, description: e.target.value})} 
            placeholder="Description" 
            className="form-control"
          />
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={newServer.active} 
              onChange={(e) => setNewServer({...newServer, active: e.target.checked})} 
            /> 
            Active
          </label>
          <button className="btn btn-success" onClick={handleCreateServer}>Add Server</button>
        </div>
      </div>

      {/* Servers List */}
      <div className="data-section">
        <h3>Server List</h3>
        {loading ? (
          <p>Loading servers...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Hostname</th>
                <th>IP Address</th>
                <th>Type</th>
                <th>Environment</th>
                <th>OS</th>
                <th>CPU Cores</th>
                <th>Memory (MB)</th>
                <th>Disk (GB)</th>
                <th>Status</th>
                <th>Description</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => (
                <tr key={server.id}>
                  {editingServer && editingServer.id === server.id ? (
                    <>
                      <td>
                        <input 
                          type="text" 
                          value={editingServer.hostname} 
                          onChange={(e) => setEditingServer({...editingServer, hostname: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingServer.ip_address} 
                          onChange={(e) => setEditingServer({...editingServer, ip_address: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select 
                          value={editingServer.type} 
                          onChange={(e) => setEditingServer({...editingServer, type: e.target.value})} 
                          className="form-control"
                        >
                          <option value="PHYSICAL">Physical</option>
                          <option value="VIRTUAL">Virtual</option>
                          <option value="CONTAINER">Container</option>
                          <option value="CLOUD">Cloud</option>
                        </select>
                      </td>
                      <td>
                        <select 
                          value={editingServer.environment} 
                          onChange={(e) => setEditingServer({...editingServer, environment: e.target.value})} 
                          className="form-control"
                        >
                          <option value="DEVELOPMENT">Development</option>
                          <option value="STAGING">Staging</option>
                          <option value="PRODUCTION">Production</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingServer.operating_system} 
                          onChange={(e) => setEditingServer({...editingServer, operating_system: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editingServer.cpu_cores || ''} 
                          onChange={(e) => setEditingServer({...editingServer, cpu_cores: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editingServer.memory_mb || ''} 
                          onChange={(e) => setEditingServer({...editingServer, memory_mb: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editingServer.disk_gb || ''} 
                          onChange={(e) => setEditingServer({...editingServer, disk_gb: parseInt(e.target.value) || 0})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select 
                          value={editingServer.status} 
                          onChange={(e) => setEditingServer({...editingServer, status: e.target.value})} 
                          className="form-control"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editingServer.description} 
                          onChange={(e) => setEditingServer({...editingServer, description: e.target.value})} 
                          className="form-control"
                        />
                      </td>
                      <td>
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={editingServer.active} 
                            onChange={(e) => setEditingServer({...editingServer, active: e.target.checked})} 
                          />
                        </label>
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm" onClick={handleUpdateServer}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingServer(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{server.hostname}</td>
                      <td>{server.ip_address}</td>
                      <td>{server.type}</td>
                      <td>{server.environment}</td>
                      <td>{server.operating_system}</td>
                      <td>{server.cpu_cores}</td>
                      <td>{server.memory_mb}</td>
                      <td>{server.disk_gb}</td>
                      <td>{server.status}</td>
                      <td>{server.description}</td>
                      <td>
                        <span className={`status-badge ${server.active ? 'active' : 'inactive'}`}>
                          {server.active ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          className={`btn btn-sm ${server.active ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActive(server.id!)}
                        >
                          {server.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => setEditingServer(server)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => server.id !== undefined && handleDeleteServer(server.id)}
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

export default ServersTab;