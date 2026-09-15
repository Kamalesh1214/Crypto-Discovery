import React from 'react';
import { ShieldCheck, Clock, FolderGit2, FileCode2, Binary, ShieldAlert } from 'lucide-react';

export function Header({ activeScan }) {
  const formattedDate = activeScan?.upload_time
    ? new Date(activeScan.upload_time).toLocaleString()
    : null;

  return (
    <header style={{
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(13, 21, 39, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
            {activeScan ? activeScan.project_name : 'Cryptographic Discovery'}
          </h2>
          {activeScan && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.35)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
              SCAN COMPLETED
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          {activeScan
            ? `Target: ${activeScan.filename} • ID: ${activeScan.id.slice(0, 8)}`
            : 'Enterprise Cryptographic Discovery & Analysis'}
        </p>
      </div>

      {activeScan && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Files Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <FileCode2 size={14} color="var(--accent-cyan)" />
            <span>Files: <strong style={{ color: '#ffffff' }}>{activeScan.files_scanned}</strong></span>
          </div>

          {/* Artefacts Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Binary size={14} color="var(--accent-teal)" />
            <span>Crypto Artefacts: <strong style={{ color: '#ffffff' }}>{activeScan.total_artefacts}</strong></span>
          </div>

          {/* Findings Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={14} color="#f87171" />
            <span>Findings: <strong style={{ color: '#ffffff' }}>{activeScan.total_artefacts}</strong></span>
          </div>

          {formattedDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <Clock size={13} />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
