import React from 'react';
import { Eye, AlertCircle, Info } from 'lucide-react';
import { ExposureBadge } from './Badge';

export function ExposureSummary({ overallExposure, distribution = {} }) {
  const veryHigh = distribution['VERY HIGH'] || 0;
  const high = distribution['HIGH'] || 0;
  const medium = distribution['MEDIUM'] || 0;
  const low = distribution['LOW'] || 0;
  const unknown = distribution['UNKNOWN'] || 0;

  const levels = [
    { label: 'Very High', count: veryHigh, color: '#ef4444' },
    { label: 'High', count: high, color: '#f97316' },
    { label: 'Medium', count: medium, color: '#eab308' },
    { label: 'Low', count: low, color: '#10b981' },
    { label: 'Unknown', count: unknown, color: '#64748b' },
  ];

  return (
    <div className="cyber-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Potential Data Exposure</h3>
        </div>
        <ExposureBadge level={overallExposure} />
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Evaluates exposure severity based on mathematical cipher vulnerability, key lengths, and data confidentiality impacts.
      </p>

      {/* Grid of exposure levels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {levels.map((lvl, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.6rem 0.4rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>{lvl.label}</div>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: lvl.count > 0 ? lvl.color : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              marginTop: '0.2rem'
            }}>
              {lvl.count}
            </div>
          </div>
        ))}
      </div>

      {/* Mandatory non-alarmist disclaimer */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        padding: '0.65rem 0.75rem',
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        borderRadius: '8px',
        fontSize: '0.7rem',
        color: 'var(--text-muted)'
      }}>
        <Info size={14} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>Disclaimer:</strong> Potential exposure is a prototype assessment based on available scan evidence and configurable rules. It is not a prediction of actual data leakage.
        </span>
      </div>
    </div>
  );
}
