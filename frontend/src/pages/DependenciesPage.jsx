import React, { useState, useEffect } from 'react';
import { 
  Network, 
  FileCode2, 
  Binary, 
  Layers, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { getInventory } from '../services/api';
import { SeverityBadge, ExposureBadge, PqcBadge } from '../components/Badge';

export function DependenciesPage({ scanId, scan }) {
  const [items, setItems] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!scanId) return;
      try {
        setLoading(true);
        const data = await getInventory(scanId);
        setItems(data);
        if (data.length > 0) {
          // Default select the first critical or high algorithm
          const criticalOrHigh = data.find((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH');
          setSelectedAlgo(criticalOrHigh ? criticalOrHigh.algorithm : data[0].algorithm);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [scanId]);

  // Group items by algorithm
  const algoMap = {};
  items.forEach((it) => {
    if (!algoMap[it.algorithm]) {
      algoMap[it.algorithm] = [];
    }
    algoMap[it.algorithm].push(it);
  });

  const uniqueAlgos = Object.keys(algoMap);
  const activeItems = selectedAlgo ? algoMap[selectedAlgo] || [] : [];

  // Distinct libraries and files for the selected algorithm
  const distinctLibraries = Array.from(new Set(activeItems.map((i) => i.library)));
  const distinctFiles = Array.from(new Set(activeItems.map((i) => i.file)));

  return (
    <div className="page-wrapper">
      {/* Module Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-teal)', fontSize: '0.85rem' }}>
            05 DEPENDENCIES
          </span>
          <span style={{ color: 'var(--border-light)' }}>•</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>
            Blast Radius Visualizer
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Trace relationships between cryptographic usage, source files, underlying libraries, and affected components
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Constructing cryptographic dependency graph...
        </div>
      ) : uniqueAlgos.length === 0 ? (
        <div className="cyber-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Dependency relationship not determined from available scan evidence.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Left Column: Algorithm Selection List */}
          <div className="cyber-card" style={{ padding: '1rem', maxHeight: '720px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              DISCOVERED CRYPTO ASSETS ({uniqueAlgos.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {uniqueAlgos.map((algo) => {
                const occurrences = algoMap[algo];
                const isSelected = selectedAlgo === algo;
                const hasCritical = occurrences.some((o) => o.severity === 'CRITICAL');
                const hasHigh = occurrences.some((o) => o.severity === 'HIGH');

                return (
                  <button
                    key={algo}
                    onClick={() => setSelectedAlgo(algo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-secondary)',
                      border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: hasCritical ? '#ef4444' : hasHigh ? '#f97316' : '#10b981'
                      }} />
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                        {algo}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {occurrences.length} usage{occurrences.length > 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Blast Radius Relationship Chain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Blast Radius Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="cyber-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Primitive
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                  {selectedAlgo}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                  {activeItems[0]?.type || 'Cryptographic Primitive'}
                </div>
              </div>

              <div className="cyber-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Affected Source Files
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                  {distinctFiles.length} File{distinctFiles.length > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Across repository codebase
                </div>
              </div>

              <div className="cyber-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Libraries Providing Usage
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                  {distinctLibraries.length} Provider{distinctLibraries.length > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  {distinctLibraries.join(', ') || 'N/A'}
                </div>
              </div>
            </div>

            {/* Interactive Relationship Flow Diagram */}
            <div className="cyber-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
                INTERACTIVE BLAST RADIUS TRACE: {selectedAlgo}
              </div>

              {/* Connected Flow Representation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
                overflowX: 'auto'
              }}>
                {/* Node 1: Primitive */}
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minWidth: '130px'
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>PRIMITIVE</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{selectedAlgo}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{activeItems[0]?.mode || 'Standard'}</div>
                </div>

                <ArrowRight size={20} color="var(--border-light)" style={{ margin: '0 0.5rem', flexShrink: 0 }} />

                {/* Node 2: Library */}
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--accent-teal)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minWidth: '140px'
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent-teal)', fontWeight: 800 }}>CRYPTO LIBRARY</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>{distinctLibraries[0] || 'Unknown'}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Dependency Binding</div>
                </div>

                <ArrowRight size={20} color="var(--border-light)" style={{ margin: '0 0.5rem', flexShrink: 0 }} />

                {/* Node 3: Affected Files */}
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--accent-purple)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minWidth: '150px'
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent-purple)', fontWeight: 800 }}>CALL SITES</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>{activeItems.length} Invocations</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{distinctFiles.length} Target Files</div>
                </div>

                <ArrowRight size={20} color="var(--border-light)" style={{ margin: '0 0.5rem', flexShrink: 0 }} />

                {/* Node 4: Blast Radius Risk */}
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-card)',
                  border: activeItems[0]?.severity === 'CRITICAL' ? '1px solid #ef4444' : '1px solid #f97316',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minWidth: '130px'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 800 }}>IMPACT SEVERITY</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: activeItems[0]?.severity === 'CRITICAL' ? '#ef4444' : '#f97316' }}>
                    {activeItems[0]?.severity}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{activeItems[0]?.potential_exposure} Exposure</div>
                </div>
              </div>

              {/* Call Site Locations Breakdown */}
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                DETAILED CALL SITES & EVIDENCE ({activeItems.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {activeItems.map((item, idx) => (
                  <div key={item.id || idx} style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileCode2 size={15} color="var(--accent-cyan)" />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                          {item.file}:{item.line}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <SeverityBadge severity={item.severity} />
                        <ExposureBadge level={item.potential_exposure} />
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#040711',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-teal)',
                      overflowX: 'auto',
                      border: '1px solid var(--border-color)'
                    }}>
                      {item.evidence || '// Direct call site evidence'}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <strong>Blast Radius: </strong> {item.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
