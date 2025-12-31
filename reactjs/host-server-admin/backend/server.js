const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'host-server.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create frameworks table
  db.run(`
    CREATE TABLE IF NOT EXISTS frameworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      category TEXT NOT NULL,
      language TEXT NOT NULL,
      version TEXT,
      url TEXT,
      supports_broker BOOLEAN DEFAULT FALSE,
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create servers table
  db.run(`
    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostname TEXT NOT NULL UNIQUE,
      ip_address TEXT NOT NULL,
      type TEXT NOT NULL, -- PHYSICAL, VIRTUAL, CONTAINER, CLOUD
      environment TEXT NOT NULL, -- DEVELOPMENT, STAGING, PRODUCTION
      operating_system TEXT,
      cpu_cores INTEGER,
      memory_mb INTEGER,
      disk_gb INTEGER,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, MAINTENANCE
      description TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create services table
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      framework_id INTEGER,
      type TEXT NOT NULL, -- REST_API, GATEWAY, etc.
      default_port INTEGER,
      api_base_path TEXT,
      repository_url TEXT,
      version TEXT,
      status TEXT DEFAULT 'PLANNED', -- ACTIVE, DEPRECATED, ARCHIVED, PLANNED
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (framework_id) REFERENCES frameworks(id)
    )
  `);

  // Create service_dependencies table
  db.run(`
    CREATE TABLE IF NOT EXISTS service_dependencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_service_id INTEGER,
      target_service_id INTEGER,
      dependency_type TEXT DEFAULT 'REQUIRED', -- REQUIRED, OPTIONAL
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_service_id) REFERENCES services(id),
      FOREIGN KEY (target_service_id) REFERENCES services(id)
    )
  `);

  // Create deployments table
  db.run(`
    CREATE TABLE IF NOT EXISTS deployments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER,
      server_id INTEGER,
      port INTEGER NOT NULL,
      version TEXT,
      status TEXT, -- RUNNING, STOPPED, FAILED, etc.
      environment TEXT NOT NULL, -- DEVELOPMENT, STAGING, PRODUCTION
      health_check_url TEXT,
      health_status TEXT, -- HEALTHY, UNHEALTHY, DEGRADED
      deployment_path TEXT,
      started_at DATETIME,
      last_health_check DATETIME,
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (server_id) REFERENCES servers(id)
    )
  `);

  // Create service_configurations table
  db.run(`
    CREATE TABLE IF NOT EXISTS service_configurations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER,
      config_key TEXT NOT NULL,
      config_value TEXT,
      environment TEXT DEFAULT 'ALL', -- ALL, DEVELOPMENT, PRODUCTION, etc.
      type TEXT DEFAULT 'STRING', -- STRING, NUMBER, BOOLEAN, URL, DATABASE_URL
      is_secret BOOLEAN DEFAULT FALSE,
      description TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id),
      UNIQUE(service_id, config_key, environment)
    )
  `);
}

// Frameworks API
app.get('/api/frameworks', (req, res) => {
  const { active } = req.query;
  let query = 'SELECT * FROM frameworks';
  const params = [];
  
  if (active !== undefined) {
    query += ' WHERE active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/frameworks/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM frameworks WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/frameworks', (req, res) => {
  const { name, description, category, language, version, url, supports_broker } = req.body;
  const query = `
    INSERT INTO frameworks (name, description, category, language, version, url, supports_broker, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [name, description, category, language, version, url, supports_broker || false, true], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/api/frameworks/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, language, version, url, supports_broker, active } = req.body;
  const query = `
    UPDATE frameworks 
    SET name = ?, description = ?, category = ?, language = ?, version = ?, url = ?, 
        supports_broker = ?, active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [name, description, category, language, version, url, supports_broker, active, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/api/frameworks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM frameworks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Toggle active status for frameworks
app.put('/api/frameworks/:id/toggle-active', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE frameworks SET active = NOT active WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Servers API
app.get('/api/servers', (req, res) => {
  const { active } = req.query;
  let query = 'SELECT * FROM servers';
  const params = [];
  
  if (active !== undefined) {
    query += ' WHERE active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY hostname';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/servers/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM servers WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/servers', (req, res) => {
  const { hostname, ip_address, type, environment, operating_system, cpu_cores, memory_mb, disk_gb, status, description } = req.body;
  const query = `
    INSERT INTO servers (hostname, ip_address, type, environment, operating_system, cpu_cores, memory_mb, disk_gb, status, description, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [hostname, ip_address, type, environment, operating_system, cpu_cores, memory_mb, disk_gb, status, description, true], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/api/servers/:id', (req, res) => {
  const { id } = req.params;
  const { hostname, ip_address, type, environment, operating_system, cpu_cores, memory_mb, disk_gb, status, description, active } = req.body;
  const query = `
    UPDATE servers 
    SET hostname = ?, ip_address = ?, type = ?, environment = ?, operating_system = ?, 
        cpu_cores = ?, memory_mb = ?, disk_gb = ?, status = ?, description = ?, 
        active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [hostname, ip_address, type, environment, operating_system, cpu_cores, memory_mb, disk_gb, status, description, active, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/api/servers/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM servers WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Toggle active status for servers
app.put('/api/servers/:id/toggle-active', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE servers SET active = NOT active WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Services API
app.get('/api/services', (req, res) => {
  const { active } = req.query;
  let query = 'SELECT * FROM services';
  const params = [];
  
  if (active !== undefined) {
    query += ' WHERE active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/services/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM services WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/services', (req, res) => {
  const { name, description, framework_id, type, default_port, api_base_path, repository_url, version, status } = req.body;
  const query = `
    INSERT INTO services (name, description, framework_id, type, default_port, api_base_path, repository_url, version, status, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [name, description, framework_id, type, default_port, api_base_path, repository_url, version, status, true], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, framework_id, type, default_port, api_base_path, repository_url, version, status, active } = req.body;
  const query = `
    UPDATE services 
    SET name = ?, description = ?, framework_id = ?, type = ?, default_port = ?, 
        api_base_path = ?, repository_url = ?, version = ?, status = ?, 
        active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [name, description, framework_id, type, default_port, api_base_path, repository_url, version, status, active, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM services WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Toggle active status for services
app.put('/api/services/:id/toggle-active', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE services SET active = NOT active WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Service Dependencies API
app.get('/api/service-dependencies', (req, res) => {
  const { active } = req.query;
  let query = 'SELECT * FROM service_dependencies';
  const params = [];
  
  if (active !== undefined) {
    query += ' WHERE active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY source_service_id';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/service-dependencies/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM service_dependencies WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/service-dependencies', (req, res) => {
  const { source_service_id, target_service_id, dependency_type } = req.body;
  const query = `
    INSERT INTO service_dependencies (source_service_id, target_service_id, dependency_type, active)
    VALUES (?, ?, ?, ?)
  `;
  db.run(query, [source_service_id, target_service_id, dependency_type || 'REQUIRED', true], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/api/service-dependencies/:id', (req, res) => {
  const { id } = req.params;
  const { source_service_id, target_service_id, dependency_type, active } = req.body;
  const query = `
    UPDATE service_dependencies 
    SET source_service_id = ?, target_service_id = ?, dependency_type = ?, 
        active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [source_service_id, target_service_id, dependency_type, active, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/api/service-dependencies/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM service_dependencies WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Toggle active status for service dependencies
app.put('/api/service-dependencies/:id/toggle-active', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE service_dependencies SET active = NOT active WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Deployments API
app.get('/api/deployments', (req, res) => {
  const { active } = req.query;
  let query = 'SELECT * FROM deployments';
  const params = [];
  
  if (active !== undefined) {
    query += ' WHERE active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY service_id';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/deployments/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM deployments WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/deployments', (req, res) => {
  const { service_id, server_id, port, version, status, environment, health_check_url, health_status, deployment_path, started_at, last_health_check } = req.body;
  const query = `
    INSERT INTO deployments (service_id, server_id, port, version, status, environment, health_check_url, health_status, deployment_path, started_at, last_health_check, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [service_id, server_id, port, version, status, environment, health_check_url, health_status, deployment_path, started_at, last_health_check, true], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/api/deployments/:id', (req, res) => {
  const { id } = req.params;
  const { service_id, server_id, port, version, status, environment, health_check_url, health_status, deployment_path, started_at, last_health_check, active } = req.body;
  const query = `
    UPDATE deployments 
    SET service_id = ?, server_id = ?, port = ?, version = ?, status = ?, 
        environment = ?, health_check_url = ?, health_status = ?, deployment_path = ?, 
        started_at = ?, last_health_check = ?, active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [service_id, server_id, port, version, status, environment, health_check_url, health_status, deployment_path, started_at, last_health_check, active, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/api/deployments/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM deployments WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Toggle active status for deployments
app.put('/api/deployments/:id/toggle-active', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE deployments SET active = NOT active WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Service Configurations API
app.get('/api/service-configurations', (req, res) => {
  const { active } = req.query;
  let query = 'SELECT * FROM service_configurations';
  const params = [];
  
  if (active !== undefined) {
    query += ' WHERE active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY service_id, config_key';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/service-configurations/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM service_configurations WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/service-configurations', (req, res) => {
  const { service_id, config_key, config_value, environment, type, is_secret, description } = req.body;
  const query = `
    INSERT INTO service_configurations (service_id, config_key, config_value, environment, type, is_secret, description, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [service_id, config_key, config_value, environment || 'ALL', type || 'STRING', is_secret || false, description, true], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/api/service-configurations/:id', (req, res) => {
  const { id } = req.params;
  const { service_id, config_key, config_value, environment, type, is_secret, description, active } = req.body;
  const query = `
    UPDATE service_configurations 
    SET service_id = ?, config_key = ?, config_value = ?, environment = ?, 
        type = ?, is_secret = ?, description = ?, active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [service_id, config_key, config_value, environment, type, is_secret, description, active, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/api/service-configurations/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM service_configurations WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Toggle active status for service configurations
app.put('/api/service-configurations/:id/toggle-active', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE service_configurations SET active = NOT active WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Import/Export endpoints
app.post('/api/import', (req, res) => {
  const { data } = req.body;
  
  // Clear existing data and import new data
  const importPromises = [];
  
  // Import frameworks
  if (data.frameworks && data.frameworks.length > 0) {
    importPromises.push(new Promise((resolve, reject) => {
      db.run('DELETE FROM frameworks', (err) => {
        if (err) reject(err);
        else {
          const stmt = db.prepare(`
            INSERT INTO frameworks (name, description, category, language, version, url, supports_broker, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const framework of data.frameworks) {
            stmt.run([
              framework.name,
              framework.description,
              framework.category,
              framework.language,
              framework.version,
              framework.url,
              framework.supportsBroker || framework.supports_broker || false,
              framework.active !== undefined ? framework.active : true
            ]);
          }
          
          stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    }));
  }
  
  // Import servers
  if (data.servers && data.servers.length > 0) {
    importPromises.push(new Promise((resolve, reject) => {
      db.run('DELETE FROM servers', (err) => {
        if (err) reject(err);
        else {
          const stmt = db.prepare(`
            INSERT INTO servers (hostname, ip_address, type, environment, operating_system, cpu_cores, memory_mb, disk_gb, status, description, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const server of data.servers) {
            stmt.run([
              server.hostname,
              server.ipAddress || server.ip_address,
              server.type,
              server.environment,
              server.operatingSystem || server.operating_system,
              server.cpuCores || server.cpu_cores,
              server.memoryMb || server.memory_mb,
              server.diskGb || server.disk_gb,
              server.status,
              server.description,
              server.active !== undefined ? server.active : true
            ]);
          }
          
          stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    }));
  }
  
  // Import services
  if (data.services && data.services.length > 0) {
    importPromises.push(new Promise((resolve, reject) => {
      db.run('DELETE FROM services', (err) => {
        if (err) reject(err);
        else {
          const stmt = db.prepare(`
            INSERT INTO services (name, description, framework_id, type, default_port, api_base_path, repository_url, version, status, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const service of data.services) {
            stmt.run([
              service.name,
              service.description,
              service.frameworkId || service.framework_id,
              service.type,
              service.defaultPort || service.default_port,
              service.apiBasePath || service.api_base_path,
              service.repositoryUrl || service.repository_url,
              service.version,
              service.status,
              service.active !== undefined ? service.active : true
            ]);
          }
          
          stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    }));
  }
  
  // Import service dependencies
  if (data.serviceDependencies && data.serviceDependencies.length > 0) {
    importPromises.push(new Promise((resolve, reject) => {
      db.run('DELETE FROM service_dependencies', (err) => {
        if (err) reject(err);
        else {
          const stmt = db.prepare(`
            INSERT INTO service_dependencies (source_service_id, target_service_id, dependency_type, active)
            VALUES (?, ?, ?, ?)
          `);
          
          for (const dependency of data.serviceDependencies) {
            stmt.run([
              dependency.sourceServiceId || dependency.source_service_id,
              dependency.targetServiceId || dependency.target_service_id,
              dependency.dependencyType || dependency.dependency_type || 'REQUIRED',
              dependency.active !== undefined ? dependency.active : true
            ]);
          }
          
          stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    }));
  }
  
  // Import deployments
  if (data.deployments && data.deployments.length > 0) {
    importPromises.push(new Promise((resolve, reject) => {
      db.run('DELETE FROM deployments', (err) => {
        if (err) reject(err);
        else {
          const stmt = db.prepare(`
            INSERT INTO deployments (service_id, server_id, port, version, status, environment, health_check_url, health_status, deployment_path, started_at, last_health_check, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const deployment of data.deployments) {
            stmt.run([
              deployment.serviceId || deployment.service_id,
              deployment.serverId || deployment.server_id,
              deployment.port,
              deployment.version,
              deployment.status,
              deployment.environment,
              deployment.healthCheckUrl || deployment.health_check_url,
              deployment.healthStatus || deployment.health_status,
              deployment.deploymentPath || deployment.deployment_path,
              deployment.startedAt || deployment.started_at,
              deployment.lastHealthCheck || deployment.last_health_check,
              deployment.active !== undefined ? deployment.active : true
            ]);
          }
          
          stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    }));
  }
  
  // Import service configurations
  if (data.serviceConfigurations && data.serviceConfigurations.length > 0) {
    importPromises.push(new Promise((resolve, reject) => {
      db.run('DELETE FROM service_configurations', (err) => {
        if (err) reject(err);
        else {
          const stmt = db.prepare(`
            INSERT INTO service_configurations (service_id, config_key, config_value, environment, type, is_secret, description, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const config of data.serviceConfigurations) {
            stmt.run([
              config.serviceId || config.service_id,
              config.configKey || config.config_key,
              config.configValue || config.config_value,
              config.environment,
              config.type,
              config.isSecret || config.is_secret || false,
              config.description,
              config.active !== undefined ? config.active : true
            ]);
          }
          
          stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    }));
  }
  
  Promise.all(importPromises)
    .then(() => {
      res.json({ success: true, message: 'Data imported successfully' });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

app.get('/api/export', (req, res) => {
  const { activeOnly } = req.query;
  const params = activeOnly === 'true' ? [1] : [];
  
  const exportData = {};
  
  // Export frameworks
  const frameworksQuery = activeOnly === 'true' 
    ? 'SELECT * FROM frameworks WHERE active = ? ORDER BY name' 
    : 'SELECT * FROM frameworks ORDER BY name';
  
  db.all(frameworksQuery, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    exportData.frameworks = rows;
    
    // Export servers
    const serversQuery = activeOnly === 'true' 
      ? 'SELECT * FROM servers WHERE active = ? ORDER BY hostname' 
      : 'SELECT * FROM servers ORDER BY hostname';
    
    db.all(serversQuery, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      exportData.servers = rows;
      
      // Export services
      const servicesQuery = activeOnly === 'true' 
        ? 'SELECT * FROM services WHERE active = ? ORDER BY name' 
        : 'SELECT * FROM services ORDER BY name';
      
      db.all(servicesQuery, params, (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        exportData.services = rows;
        
        // Export service dependencies
        const serviceDependenciesQuery = activeOnly === 'true' 
          ? 'SELECT * FROM service_dependencies WHERE active = ? ORDER BY source_service_id' 
          : 'SELECT * FROM service_dependencies ORDER BY source_service_id';
        
        db.all(serviceDependenciesQuery, params, (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          exportData.serviceDependencies = rows;
          
          // Export deployments
          const deploymentsQuery = activeOnly === 'true' 
            ? 'SELECT * FROM deployments WHERE active = ? ORDER BY service_id' 
            : 'SELECT * FROM deployments ORDER BY service_id';
          
          db.all(deploymentsQuery, params, (err, rows) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            exportData.deployments = rows;
            
            // Export service configurations
            const serviceConfigurationsQuery = activeOnly === 'true' 
              ? 'SELECT * FROM service_configurations WHERE active = ? ORDER BY service_id, config_key' 
              : 'SELECT * FROM service_configurations ORDER BY service_id, config_key';
            
            db.all(serviceConfigurationsQuery, params, (err, rows) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              exportData.serviceConfigurations = rows;
              
              res.json(exportData);
            });
          });
        });
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});