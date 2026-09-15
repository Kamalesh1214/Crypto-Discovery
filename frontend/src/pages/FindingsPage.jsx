import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  FileCode, 
  Lightbulb, 
  Atom, 
  Eye, 
  ChevronRight 
} from 'lucide-react';
import { getFindings } from '../services/api';
import { SeverityBadge, ExposureBadge, EffortBadge, PqcBadge } from '../components/Badge';
import { FindingDetailModal } from '../components/FindingDetailModal';

export function FindingsPage({ scanId }) {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!scanId) return;
      try {
        setLoading(true);
        const data = await getFindings(scanId);
        setFindings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [scanId]);

  const groups = [
    { title: 'CRITICAL SEVERITY', key: 'CRITICAL', color: '#ef4444', icon: ShieldAlert },
    { title: 'HIGH SEVERITY', key: 'HIGH', color: '#f97316', icon: AlertTriangle },
    { title: 'MEDIUM SEVERITY', key: 'MEDIUM', color: '#eab308', icon: AlertCircle },
    { title: 'LOW & INFORMATIONAL', key: 'LOW', color: '#10b981', icon: CheckCircle },
  ];

  const getItemsForGroup = (key) => {
    if (key === 'LOW') {
      return findings.filter((f) => f.severity === 'LOW' || f.severity === 'INFORMATIONAL');
    }
    return findings.filter((f) => f.severity === key);
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
          Security Findings
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Detailed triage view categorized by severity with actionable remediation and exposure insights
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading findings...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {groups.map((grp) => {
            const items = getItemsForGroup(grp.key);
            const Icon = grp.icon;

            return (
              <div key={grp.key}>
                {/* Group Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  paddingBottom: '0.6rem',
                  borderBottom: `2px solid ${grp.color}`,
                  marginBottom: '1rem'
                }}>
                  <Icon size={20} color={grp.color} />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: grp.color }}>
                    {grp.title}
                  </h2>
                  <span style={{
                    marginLeft: 'auto',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#ffffff'
                  }}>
                    {items.length} Finding{items.length === 1 ? '' : 's'}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-color)',
                    color: 'var(--text-dim)',
                    fontSize: '0.85rem'
                  }}>
                    No findings in this category.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="cyber-card"
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}
                        onClick={() => setSelectedFinding(item)}
                      >
                        {/* Finding Row Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                              {item.algorithm}
                            </span>
                            <SeverityBadge severity={item.severity} />
                            <ExposureBadge level={item.potential_exposure} />
                            <PqcBadge candidate={item.pqc_migration_candidate} />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                            <FileCode size={14} />
                            <span>{item.file}:{item.line}</span>
                          </div>
                        </div>

                        {/* Reason & Recommendation Preview */}
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                          <strong style={{ color: '#f87171' }}>Risk: </strong> {item.reason}
                        </div>

                        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                          <strong style={{ color: 'var(--accent-teal)' }}>Remediation: </strong> {item.recommendation}
                        </div>

                        {/* Footer Badges */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '0.6rem',
                          marginTop: '0.2rem',
                          fontSize: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
                            <span>Mode: <strong style={{ color: 'var(--text-muted)' }}>{item.mode}</strong></span>
                            <span>Key: <strong style={{ color: 'var(--text-muted)' }}>{item.key_size}</strong></span>
                            <span>PQC Effort: <strong style={{ color: 'var(--accent-cyan)' }}>{item.migration_time_estimate}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            <span>Full Details</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </div>
  );
}
