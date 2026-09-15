import React from 'react';
import { 
  FileCode2, 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle,
  Binary, 
  Gauge, 
  Eye, 
  Atom, 
  ChevronRight,
  ArrowUpRight,
  Network,
  GitPullRequest,
  CheckCircle2,
  Database
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { RiskChart } from '../components/RiskChart';
import { ExposureSummary } from '../components/ExposureSummary';
import { MigrationSummary } from '../components/MigrationSummary';
import { SeverityBadge, ExposureBadge, EffortBadge } from '../components/Badge';

export function OverviewPage({ scan, onNavigate }) {
  if (!scan) return null;

  const summary = scan.summary_data || {};
  const riskDist = summary.risk_distribution || {};
  const exposureDist = summary.exposure_distribution || {};
  const migrationDist = summary.migration_distribution || {};

  // Score color logic
  const score = scan.risk_score;
  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f97316' : '#ef4444';

  return (
    <div className="page-wrapper">
      {/* Top Banner & Module Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 800, 
              color: 'var(--accent-cyan)', 
              fontSize: '0.85rem' 
            }}>
              02 OVERVIEW
            </span>
            <span style={{ color: 'var(--border-light)' }}>•</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Executive Readiness Center
            </h1>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            High-level cryptographic posture, classical risk distribution, and post-quantum migration summary for <strong>{scan.project_name}</strong>
          </p>
        </div>

        {/* Action Buttons to Other Modules */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button 
            onClick={() => onNavigate('cbom')}
            className="cyber-btn cyber-btn-secondary"
          >
            <Database size={15} color="var(--accent-cyan)" />
            <span>03 CBOM Studio</span>
          </button>
          <button 
            onClick={() => onNavigate('risk_mosca')}
            className="cyber-btn cyber-btn-secondary"
          >
            <Atom size={15} color="var(--accent-purple)" />
            <span>04 Risk / Mosca</span>
          </button>
          <button 
            onClick={() => onNavigate('migration')}
            className="cyber-btn cyber-btn-primary"
          >
            <GitPullRequest size={15} />
            <span>06 Migration</span>
          </button>
        </div>
      </div>

      {/* Completion Notification Callout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '10px',
        marginBottom: '1.75rem',
        fontSize: '0.82rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span style={{ color: '#ffffff' }}>
            <strong>SCAN COMPLETED:</strong> Cryptographic analysis for <strong>{scan.project_name}</strong> concluded with <strong>{scan.total_artefacts} artefacts</strong> discovered across <strong>{scan.files_scanned} files</strong>.
          </span>
        </div>

        <span style={{ fontSize: '0.75rem', color: '#6ee7b7', fontFamily: 'var(--font-mono)' }}>
          Risk Score: {scan.risk_score} / 100
        </span>
      </div>

      {/* Primary Metrics Row 1 */}
      <div className="metric-grid">
        <MetricCard
          title="Files Scanned"
          value={scan.files_scanned}
          description="Verified source & config files"
          icon={FileCode2}
        />
        <MetricCard
          title="Crypto Artefacts"
          value={scan.total_artefacts}
          description="Cryptographic usage points"
          icon={Binary}
        />
        <MetricCard
          title="Critical Findings"
          value={scan.critical_count}
          description="Obsolete / broken cryptography"
          icon={ShieldAlert}
          valueColor={scan.critical_count > 0 ? '#ef4444' : 'var(--text-main)'}
          badge={<SeverityBadge severity="CRITICAL" />}
        />
        <MetricCard
          title="High Findings"
          value={scan.high_count}
          description="High severity vulnerabilities"
          icon={AlertTriangle}
          valueColor={scan.high_count > 0 ? '#f97316' : 'var(--text-main)'}
          badge={<SeverityBadge severity="HIGH" />}
        />
        <MetricCard
          title="Medium Findings"
          value={scan.medium_count}
          description="Medium severity issues"
          icon={AlertCircle}
          valueColor={scan.medium_count > 0 ? '#eab308' : 'var(--text-main)'}
          badge={<SeverityBadge severity="MEDIUM" />}
        />
      </div>

      {/* Primary Metrics Row 2 (Risk Score, Potential Exposure, PQC Migration) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {/* Risk Score Card */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Cryptographic Discovery Risk Score
            </span>
            <Gauge size={20} color="var(--accent-cyan)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.75rem 0' }}>
            <span style={{ fontSize: '2.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: scoreColor }}>
              {score}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ 100</span>
          </div>

          <div>
            <div style={{
              height: '6px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                height: '100%',
                width: `${score}%`,
                backgroundColor: scoreColor,
                transition: 'width 0.4s ease'
              }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              100 = Best Posture. Deductions: -25 Critical, -15 High, -8 Medium.
            </div>
          </div>
        </div>

        {/* Potential Exposure Card */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Potential Data Exposure
            </span>
            <Eye size={20} color="var(--accent-cyan)" />
          </div>

          <div style={{ margin: '0.75rem 0' }}>
            <ExposureBadge level={scan.potential_exposure} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
              {scan.potential_exposure === 'VERY HIGH' || scan.potential_exposure === 'HIGH'
                ? 'High Risk of Confidentiality Compromise'
                : scan.potential_exposure === 'MEDIUM'
                ? 'Moderate Cryptographic Risk Detected'
                : 'Low Direct Exposure Identified'}
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Assessment based on key size, cipher mode, and known breaks.
          </div>
        </div>

        {/* PQC Migration Effort Card */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              PQC Migration Effort
            </span>
            <Atom size={20} color="var(--accent-purple)" />
          </div>

          <div style={{ margin: '0.75rem 0' }}>
            <EffortBadge 
              effort={scan.pqc_migration_effort} 
              timeEstimate={summary.pqc_time_estimate} 
            />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
              {scan.pqc_candidate_count} Asymmetric Usages Identified
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Priority Target: <strong>{scan.highest_pqc_candidate}</strong>
          </div>
        </div>
      </div>

      {/* In-Depth Visual Breakdown Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        <RiskChart distribution={riskDist} />
        <ExposureSummary overallExposure={scan.potential_exposure} distribution={exposureDist} />
        <MigrationSummary
          candidateCount={scan.pqc_candidate_count}
          effort={scan.pqc_migration_effort}
          timeEstimate={summary.pqc_time_estimate}
          highestCandidate={scan.highest_pqc_candidate}
          distribution={migrationDist}
        />
      </div>
    </div>
  );
}
