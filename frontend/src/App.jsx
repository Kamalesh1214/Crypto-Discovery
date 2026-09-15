import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { OverviewPage } from './pages/OverviewPage';
import { CBOMPage } from './pages/CBOMPage';
import { RiskMoscaPage } from './pages/RiskMoscaPage';
import { DependenciesPage } from './pages/DependenciesPage';
import { MigrationPage } from './pages/MigrationPage';
import { listScans } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState('discovery');
  const [activeScan, setActiveScan] = useState(null);

  // Restore the latest completed scan for module data, but ALWAYS land on Discovery.
  // Overview is reached only after the current scan completes successfully.
  useEffect(() => {
    async function fetchLatest() {
      try {
        const scans = await listScans();
        if (scans && scans.length > 0) {
          setActiveScan(scans[0]);
        }
      } catch (err) {
        // First run or empty database: Discovery remains the landing page.
      }
    }
    fetchLatest();
  }, []);

  const handleScanComplete = (scanResult) => {
    // Keep the user on Discovery after the scan completes so the real scan
    // console remains visible. Overview is opened explicitly by the user.
    setActiveScan(scanResult);
  };

  const handleOpenOverview = () => {
    if (activeScan) setCurrentView('overview');
  };

  return (
    <div className="app-container">
      {/* 6-Module Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        hasActiveScan={!!activeScan}
      />

      {/* Main Content Area */}
      <div className="main-content" style={{ marginLeft: '280px' }}>
        <Header activeScan={activeScan} />

        <main style={{ flex: 1 }}>
          {/* Module 01: Discovery (Assets Ingestion Console) */}
          {currentView === 'discovery' && (
            <DiscoveryPage onScanComplete={handleScanComplete} onOpenOverview={handleOpenOverview} />
          )}

          {/* Module 02: Overview (Executive Readiness Center) */}
          {currentView === 'overview' && activeScan && (
            <OverviewPage
              scan={activeScan}
              onNavigate={setCurrentView}
            />
          )}

          {/* Module 03: CBOM (Cryptographic Inventory Studio) */}
          {currentView === 'cbom' && activeScan && (
            <CBOMPage
              scanId={activeScan.id}
              scan={activeScan}
            />
          )}

          {/* Module 04: Risk / Mosca (Quantum Exposure Engine) */}
          {currentView === 'risk_mosca' && activeScan && (
            <RiskMoscaPage
              scanId={activeScan.id}
              scan={activeScan}
            />
          )}

          {/* Module 05: Dependencies (Blast Radius Visualizer) */}
          {currentView === 'dependencies' && activeScan && (
            <DependenciesPage
              scanId={activeScan.id}
              scan={activeScan}
            />
          )}

          {/* Module 06: Migration (Hybrid Remediation Workbench) */}
          {currentView === 'migration' && activeScan && (
            <MigrationPage
              scanId={activeScan.id}
              scan={activeScan}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
