import React, { useState, useEffect } from 'react';
import './App.css';
import FrameworksTab from './components/FrameworksTab';
import ServersTab from './components/ServersTab';
import ServicesTab from './components/ServicesTab';
import ServiceDependenciesTab from './components/ServiceDependenciesTab';
import DeploymentsTab from './components/DeploymentsTab';
import ServiceConfigurationsTab from './components/ServiceConfigurationsTab';
import ImportExportTab from './components/ImportExportTab';

function App() {
  const [activeTab, setActiveTab] = useState('frameworks');

  const tabs = [
    { id: 'frameworks', label: 'Frameworks' },
    { id: 'servers', label: 'Servers' },
    { id: 'services', label: 'Services' },
    { id: 'service-dependencies', label: 'Service Dependencies' },
    { id: 'deployments', label: 'Deployments' },
    { id: 'configurations', label: 'Service Configurations' },
    { id: 'import-export', label: 'Import/Export' }
  ];

  return (
    <div className="admin-console">
      <header className="console-header">
        <h1>Host Server Admin Console</h1>
        <div className="header-actions">
          <button className="btn btn-primary">Refresh Data</button>
        </div>
      </header>
      
      <nav className="console-nav">
        <ul className="nav-tabs">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-tab">
              <button 
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <main className="console-main">
        <div className="tab-content">
          {activeTab === 'frameworks' && <FrameworksTab />}
          {activeTab === 'servers' && <ServersTab />}
          {activeTab === 'services' && <ServicesTab />}
          {activeTab === 'service-dependencies' && <ServiceDependenciesTab />}
          {activeTab === 'deployments' && <DeploymentsTab />}
          {activeTab === 'configurations' && <ServiceConfigurationsTab />}
          {activeTab === 'import-export' && <ImportExportTab />}
        </div>
      </main>
    </div>
  );
}

export default App;