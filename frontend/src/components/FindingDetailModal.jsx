import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Lightbulb, 
  FileCode, 
  Atom, 
  Eye, 
  Cpu, 
  KeyRound, 
  BookOpen,
  Info
} from 'lucide-react';
import { SeverityBadge, ExposureBadge, PqcBadge, EffortBadge } from './Badge';

export function FindingDetailModal({ finding, onClose }) {
  if (!finding) return null;

  const exposureFactors = Array.isArray(finding.exposure_factors) 
    ? finding.exposure_factors 
    : [];

  const migrationFactors = Array.isArray(finding.migration_factors)
    ? finding.migration_factors
    : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {finding.algorithm}
              </h2>
              <SeverityBadge severity={finding.severity} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {finding.type} • Library: <strong style={{ color: 'var(--accent-cyan)' }}>{finding.library}</strong>
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              padding: '0.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Technical Attributes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-primary)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>File & Location</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
              {finding.file}:{finding.line}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Cipher Mode</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
              {finding.mode || 'Unknown / Not Determined'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Key Length</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-teal)', marginTop: '0.2rem' }}>
              {finding.key_size || 'Unknown / Not Determined'}
            </div>
          </div>
        </div>

        {/* Section 1: Why is it risky & Recommendation */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <ShieldAlert size={16} />
              <span>WHY IS IT RISKY?</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {finding.reason}
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-teal)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <Lightbulb size={16} />
              <span>RECOMMENDATION</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {finding.recommendation}
            </p>
          </div>
        </div>

        {/* Section 2: Potential Data Exposure */}
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Eye size={16} />
              <span>POTENTIAL DATA EXPOSURE</span>
            </div>
            <ExposureBadge level={finding.potential_exposure} />
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            {finding.exposure_reason}
          </p>

          {exposureFactors.length > 0 && (
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                EXPOSURE FACTORS IDENTIFIED:
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {exposureFactors.map((factor, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{factor}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Disclaimer: Potential exposure is a prototype assessment based on available scan evidence. It is not a prediction of actual data leakage.
          </div>
        </div>

        {/* Section 3: Post-Quantum Migration */}
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Atom size={16} />
              <span>POST-QUANTUM MIGRATION</span>
            </div>
            <PqcBadge candidate={finding.pqc_migration_candidate} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            <div>Quantum Risk: <strong style={{ color: finding.quantum_risk === 'HIGH' ? '#f87171' : 'var(--text-main)' }}>{finding.quantum_risk}</strong></div>
            <div>Migration Effort: <strong style={{ color: 'var(--accent-cyan)' }}>{finding.migration_effort}</strong></div>
            <div>Estimate: <strong style={{ color: '#ffffff' }}>{finding.migration_time_estimate}</strong></div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            {finding.migration_reason}
          </p>

          {migrationFactors.length > 0 && (
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                MIGRATION FACTORS CONSIDERED:
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {migrationFactors.map((factor, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{factor}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Disclaimer: Migration estimates are approximate prototype estimates and should not be treated as guaranteed project timelines.
          </div>
        </div>

        {/* Section 4: Source Evidence */}
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.6rem' }}>
            <FileCode size={16} />
            <span>SOURCE EVIDENCE</span>
          </div>

          <div className="code-snippet">
            <span style={{ color: 'var(--text-dim)', marginRight: '1rem' }}>Line {finding.line}:</span>
            {finding.evidence || '// No direct line snippet available'}
          </div>
        </div>
      </div>
    </div>
  );
}
