import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export function RiskChart({ distribution = {} }) {
  const critical = distribution.CRITICAL || 0;
  const high = distribution.HIGH || 0;
  const medium = distribution.MEDIUM || 0;
  const low = (distribution.LOW || 0) + (distribution.INFORMATIONAL || 0);
  const total = critical + high + medium + low || 1;

  const items = [
    { label: 'Critical', count: critical, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', icon: ShieldAlert },
    { label: 'High', count: high, color: '#f97316', bg: 'rgba(249, 115, 22, 0.2)', icon: AlertTriangle },
    { label: 'Medium', count: medium, color: '#eab308', bg: 'rgba(234, 179, 8, 0.2)', icon: AlertCircle },
    { label: 'Low / Info', count: low, color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', icon: CheckCircle },
  ];

  return (
    <div className="cyber-card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Risk Distribution</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Breakdown of detected cryptographic artefacts by classical severity
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
          {critical + high + medium + low} Total
        </span>
      </div>

      {/* Multi-segment stacked distribution bar */}
      <div style={{
        height: '12px',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '6px',
        display: 'flex',
        overflow: 'hidden',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color)'
      }}>
        {items.map((item, idx) => {
          const pct = ((item.count / total) * 100).toFixed(1);
          if (item.count === 0) return null;
          return (
            <div
              key={idx}
              title={`${item.label}: ${item.count} (${pct}%)`}
              style={{
                width: `${pct}%`,
                backgroundColor: item.color,
                transition: 'width 0.3s ease'
              }}
            />
          );
        })}
      </div>

      {/* Itemized breakdown rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item, idx) => {
          const Icon = item.icon;
          const pct = ((item.count / total) * 100).toFixed(0);
          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '0.35rem', borderRadius: '6px', backgroundColor: item.bg, color: item.color }}>
                  <Icon size={14} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {item.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pct}%</span>
                <span style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 800, 
                  fontFamily: 'var(--font-mono)',
                  color: item.count > 0 ? item.color : 'var(--text-dim)' 
                }}>
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
