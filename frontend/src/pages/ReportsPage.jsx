import React, { useState } from 'react';
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  ShieldCheck, 
  Layers, 
  CheckCircle,
  ExternalLink,
  Code
} from 'lucide-react';
import { getJsonReportUrl, getCsvReportUrl } from '../services/api';

export function ReportsPage({ scan }) {
  if (!scan) return null;

  const jsonUrl = getJsonReportUrl(scan.id);
  const csvUrl = getCsvReportUrl(scan.id);

  const exportedFields = [
    'Algorithm', 'Type', 'Mode', 'Key Size', 'Library',
    'File', 'Line', 'Evidence', 'Severity', 'Reason',
    'Recommendation', 'Quantum Risk', 'PQC Migration Candidate',
    'Potential Exposure', 'Exposure Reason', 'Migration Effort',
    'Migration Time Estimate', 'Migration Reason'
  ];

  return (
    <div className="page-wrapper" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
          Compliance & Security Reports
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Export comprehensive cryptographic Bill of Materials (CBOM) and executive compliance data
        </p>
      </div>

      {/* Export Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* JSON Export Card */}
        <div className="cyber-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                <FileJson size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>JSON Structured CBOM</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Machine-readable cryptographic SBOM</span>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Standardized JSON format including scan metadata, executive summary metrics, detailed cryptographic artefact inventory, disclaimers, and exposure ratings.
            </p>
          </div>

          <a
            href={jsonUrl}
            download
            className="cyber-btn cyber-btn-primary"
            style={{ width: '100%', textDecoration: 'none' }}
          >
            <Download size={16} />
            <span>Download JSON Report</span>
          </a>
        </div>

        {/* CSV Export Card */}
        <div className="cyber-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>CSV Spreadsheet Export</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Tabular spreadsheet for security audits</span>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Tabular spreadsheet compatible with Microsoft Excel, Google Sheets, and SIEM data ingestion pipelines. Covers all 18 discovery and PQC attributes.
            </p>
          </div>

          <a
            href={csvUrl}
            download
            className="cyber-btn cyber-btn-secondary"
            style={{ width: '100%', textDecoration: 'none', borderColor: 'var(--accent-teal)', color: 'var(--accent-teal)' }}
          >
            <Download size={16} />
            <span>Download CSV Spreadsheet</span>
          </a>
        </div>
      </div>

      {/* Export Schema Coverage */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Layers size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            Exported Attributes Schema Coverage (18 Fields)
          </h3>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Every exported report guarantees deterministic, evidence-grounded values across the entire cryptographic lifecycle:
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {exportedFields.map((f, i) => (
            <span 
              key={i} 
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                color: 'var(--accent-cyan)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <CheckCircle size={12} color="var(--accent-teal)" />
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
