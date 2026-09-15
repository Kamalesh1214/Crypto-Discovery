import React from 'react';
import { 
  UploadCloud, 
  LayoutDashboard, 
  Database, 
  Atom, 
  Network, 
  GitPullRequest, 
  PlusCircle,
  Layers
} from 'lucide-react';

export function Sidebar({ currentView, setCurrentView, hasActiveScan }) {
  const modules = [
    {
      id: 'discovery',
      code: '01',
      name: 'Discovery',
      subtitle: 'Assets Ingestion Console',
      icon: UploadCloud,
      requiresScan: false
    },
    {
      id: 'overview',
      code: '02',
      name: 'Overview',
      subtitle: 'Executive Readiness Center',
      icon: LayoutDashboard,
      requiresScan: true
    },
    {
      id: 'cbom',
      code: '03',
      name: 'CBOM',
      subtitle: 'Cryptographic Inventory Studio',
      icon: Database,
      requiresScan: true
    },
    {
      id: 'risk_mosca',
      code: '04',
      name: 'Risk / Mosca',
      subtitle: 'Quantum Exposure Engine',
      icon: Atom,
      requiresScan: true
    },
    {
      id: 'dependencies',
      code: '05',
      name: 'Dependencies',
      subtitle: 'Blast Radius Visualizer',
      icon: Network,
      requiresScan: true
    },
    {
      id: 'migration',
      code: '06',
      name: 'Migration',
      subtitle: 'Hybrid Remediation Workbench',
      icon: GitPullRequest,
      requiresScan: true
    },
  ];

  return (
    <aside className="sidebar" style={{ width: '280px' }}>
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: '#000000',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.25)'
          }}>
            <img
              src="/logo.png"
              alt="Cryptographic Discovery logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.2 }}>
              Cryptographic Discovery
            </h1>
            <p style={{ fontSize: '0.67rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '0.2rem' }}>
              Enterprise Cryptographic Discovery & Analysis
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
        <div style={{ 
          fontSize: '0.65rem', 
          fontWeight: 800, 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          color: 'var(--text-dim)', 
          padding: '0.4rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Product Modules</span>
          <span style={{ color: 'var(--accent-cyan)' }}>6 Modules</span>
        </div>

        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = currentView === mod.id;
          const isDisabled = mod.requiresScan && !hasActiveScan;

          return (
            <button
              key={mod.id}
              disabled={isDisabled}
              onClick={() => setCurrentView(mod.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                color: isActive ? '#ffffff' : isDisabled ? 'var(--text-dim)' : 'var(--text-muted)',
                textAlign: 'left',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.35 : 1,
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-dim)'
              }}>
                {mod.code}
              </span>

              <Icon size={17} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />

              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 600, whiteSpace: 'nowrap' }}>
                  {mod.name}
                </span>
                <span style={{ fontSize: '0.65rem', color: isActive ? 'var(--accent-teal)' : 'var(--text-dim)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {mod.subtitle}
                </span>
              </div>

              {isActive && (
                <div style={{
                  marginLeft: 'auto',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-cyan)',
                  boxShadow: '0 0 8px var(--accent-cyan)'
                }} />
              )}
            </button>
          );
        })}

        {/* Action: New Scan */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setCurrentView('discovery')}
            className="cyber-btn cyber-btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: '0.65rem 0.85rem',
              fontSize: '0.8rem',
              borderColor: 'var(--border-light)'
            }}
          >
            <PlusCircle size={16} color="var(--accent-cyan)" />
            <span>New Scan</span>
          </button>
        </div>
      </nav>

      {/* Footer Info */}
      <div style={{ 
        padding: '0.85rem 1rem', 
        borderTop: '1px solid var(--border-color)', 
        backgroundColor: 'rgba(0,0,0,0.25)',
        fontSize: '0.68rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
          <Layers size={13} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>SIH 2026 PS SIH26164</span>
        </div>
        <div>Enterprise Cryptographic Discovery Tool</div>
      </div>
    </aside>
  );
}
