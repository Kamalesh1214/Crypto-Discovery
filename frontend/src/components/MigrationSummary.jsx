import React from 'react';
import { Atom, Clock, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { EffortBadge } from './Badge';

export function MigrationSummary({ 
  candidateCount = 0, 
  effort = 'NOT REQUIRED', 
  timeEstimate = 'Not Required', 
  highestCandidate = 'None',
  distribution = {}
}) {
  return (
    <div className="cyber-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Atom size={20} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>PQC Migration Readiness</h3>
        </div>
        <EffortBadge effort={effort} timeEstimate={timeEstimate} />
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Identifies public-key algorithms susceptible to Shor's quantum algorithm and estimates transition planning complexity.
      </p>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.75rem'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>PQC Candidates</div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: candidateCount > 0 ? 'var(--accent-purple)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginTop: '0.2rem'
          }}>
            {candidateCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Asymmetric usages</div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.75rem'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>Migration Effort</div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: effort === 'HIGH' ? '#ef4444' : effort === 'MEDIUM' ? '#f97316' : 'var(--accent-cyan)',
            fontFamily: 'var(--font-mono)',
            marginTop: '0.35rem'
          }}>
            {effort}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Scope complexity</div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.75rem'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>Highest Priority</div>
          <div style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            marginTop: '0.35rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {highestCandidate || 'None'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Priority target</div>
        </div>
      </div>

      {/* Disclaimers */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        padding: '0.65rem 0.75rem',
        backgroundColor: 'rgba(168, 85, 247, 0.05)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: '8px',
        fontSize: '0.7rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Info size={13} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
          <span><strong>Prototype Estimate:</strong> 1–2 wks (Low), 2–6 wks (Medium), 6+ wks (High). Not guaranteed project timelines.</span>
        </div>
        <div style={{ fontSize: '0.67rem', color: 'var(--text-dim)', paddingLeft: '1.2rem' }}>
          PQC migration assessment identifies potential candidates for further analysis; it does not automatically migrate production software.
        </div>
      </div>
    </div>
  );
}
