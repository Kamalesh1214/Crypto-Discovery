import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileArchive, 
  ShieldCheck, 
  Play, 
  Loader2, 
  AlertCircle,
  CheckCircle2, 
  Circle,
  FileCode,
  Binary,
  Layers,
  Sparkles,
  Search,
  Lock,
  Cpu
} from 'lucide-react';
import { uploadAndScan } from '../services/api';

export function DiscoveryPage({ onScanComplete, onOpenOverview }) {
  const [file, setFile] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanMetrics, setScanMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const pipelineStages = [
    { code: '01', key: 'upload', name: 'UPLOAD' },
    { code: '02', key: 'validate', name: 'VALIDATE' },
    { code: '03', key: 'discover', name: 'DISCOVER' },
    { code: '04', key: 'analyze', name: 'ANALYZE' },
    { code: '05', key: 'assess', name: 'ASSESS' },
    { code: '06', key: 'generate_report', name: 'GENERATE REPORT' },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.zip')) {
        setError('Only .ZIP software repository archives are supported for safe static analysis.');
        return;
      }
      setFile(selected);
      setError(null);
      if (!projectName) {
        setProjectName(selected.name.replace(/\.zip$/i, ''));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (!dropped.name.toLowerCase().endsWith('.zip')) {
        setError('Only .ZIP software repository archives are supported for safe static analysis.');
        return;
      }
      setFile(dropped);
      setError(null);
      if (!projectName) {
        setProjectName(dropped.name.replace(/\.zip$/i, ''));
      }
    }
  };

  const startScan = async () => {
    if (!file) {
      setError('Please select or drop a repository .ZIP archive to begin discovery.');
      return;
    }

    setError(null);
    setScanCompleted(false);
    setIsScanning(true);

    // Initial state before first backend poll
    setScanMetrics({
      progress: null,
      stage_index: 1,
      stage_name: 'UPLOAD',
      files_discovered: null,
      files_analyzed: null,
      supported_files: null,
      ignored_files: null,
      crypto_artifacts: null,
      findings: null,
      current_file: 'Uploading archive and initializing sandbox...',
      current_algorithm: 'N/A',
      logs: []
    });

    try {
      // Real backend progress callback
      const completedScan = await uploadAndScan(file, projectName, (liveStatus) => {
        setScanMetrics({
          progress: typeof liveStatus.progress === 'number' ? liveStatus.progress : null,
          stage_index: liveStatus.stage_index || 1,
          stage_name: liveStatus.stage_name || 'ANALYZE',
          files_discovered: liveStatus.files_discovered ?? null,
          files_analyzed: liveStatus.files_analyzed ?? null,
          supported_files: liveStatus.supported_files ?? null,
          ignored_files: liveStatus.ignored_files ?? null,
          crypto_artifacts: liveStatus.crypto_artifacts ?? null,
          findings: liveStatus.findings ?? null,
          current_file: liveStatus.current_file || 'Calculating...',
          current_algorithm: liveStatus.current_algorithm || 'N/A',
          logs: Array.isArray(liveStatus.logs) ? liveStatus.logs : []
        });
      });

      // IMPORTANT: stay on Discovery after completion. The completed scan
      // remains visible in the same live console until the user chooses
      // to open Overview. No automatic navigation is performed.
      setScanCompleted(true);
      onScanComplete(completedScan);

    } catch (err) {
      setIsScanning(false);
      setError(err.message || 'Scan failed to process.');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '960px', marginTop: '1rem' }}>
      {/* Title & Introduction */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.45rem', 
          padding: '0.3rem 0.85rem', 
          borderRadius: '9999px',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--accent-cyan)',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '0.75rem'
        }}>
          <ShieldCheck size={15} />
          <span>Module 01: Assets Ingestion Console • SIH26164</span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: '0.35rem' }}>
          Cryptographic Discovery
        </h1>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--accent-teal)', fontWeight: 600, marginBottom: '0.75rem' }}>
          Enterprise Cryptographic Discovery & Analysis
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.55 }}>
          Discover cryptographic assets. Understand security exposure. Prepare for post-quantum migration.
        </p>
      </div>

      {/* DYNAMIC SCANNING CONSOLE (Shown while scanning) */}
      {(isScanning || scanCompleted) && scanMetrics ? (
        <div className="cyber-card" style={{ padding: '2rem', border: '1px solid var(--accent-cyan)', boxShadow: '0 0 35px rgba(6, 182, 212, 0.15)' }}>
          {/* Top Status Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: scanCompleted ? '#10b981' : 'var(--accent-cyan)', fontWeight: 800, letterSpacing: '0.05em' }}>
                {scanCompleted ? 'SCAN COMPLETED • RESULTS READY' : 'LIVE SCANNING IN PROGRESS'}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                Scanning: <span style={{ color: 'var(--accent-teal)' }}>{file ? file.name : 'Repository Archive'}</span>
              </h3>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Current stage: <strong style={{ color: 'var(--accent-cyan)' }}>{scanMetrics.stage_name || 'Calculating...'}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {typeof scanMetrics.progress === 'number' ? `${scanMetrics.progress}%` : 'Calculating...'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: '10px',
            width: '100%',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '5px',
            overflow: 'hidden',
            marginBottom: '2rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.max(0, Math.min(100, Number(scanMetrics.progress ?? 0)))}%`,
              background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-cyan))',
              boxShadow: '0 0 12px var(--accent-cyan)',
              transition: 'width 0.25s ease-out'
            }} />
          </div>

          {/* PIPELINE STAGES */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              CURRENT SCAN PIPELINE
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              {pipelineStages.map((st, idx) => {
                const stageNum = idx + 1;
                const isCompleted = scanMetrics.stage_index > stageNum;
                const isActive = scanMetrics.stage_index === stageNum;

                return (
                  <div key={st.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.6rem',
                    borderRadius: '6px',
                    backgroundColor: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent'
                  }}>
                    {isCompleted ? (
                      <CheckCircle2 size={15} color="#10b981" />
                    ) : isActive ? (
                      <Loader2 size={15} className="animate-spin" color="var(--accent-cyan)" />
                    ) : (
                      <Circle size={15} color="var(--text-dim)" />
                    )}
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isCompleted ? '#10b981' : isActive ? 'var(--accent-cyan)' : 'var(--text-dim)',
                      whiteSpace: 'nowrap'
                    }}>
                      {st.code} {st.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LIVE SCAN METRICS */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              LIVE SCAN METRICS (REAL-TIME BACKEND STATE)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Files Discovered</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  {scanMetrics.files_discovered ?? 'Calculating...'}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Files Analyzed</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  {scanMetrics.files_analyzed ?? 'Calculating...'}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Crypto Artefacts</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  {scanMetrics.crypto_artifacts ?? 'Calculating...'}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Findings Identified</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  {scanMetrics.findings ?? 'Calculating...'}
                </div>
              </div>
            </div>
          </div>

          {/* LIVE SCAN CONSOLE: every entry is emitted by the backend from actual scan events. */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              LIVE SCAN CONSOLE • STATIC ANALYSIS
            </div>
            <div style={{
              backgroundColor: '#070d18',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              padding: '0.85rem',
              maxHeight: '230px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              lineHeight: 1.65
            }}>
              {scanMetrics.logs?.length ? scanMetrics.logs.map((entry, index) => (
                <div key={`${entry.timestamp}-${index}`} style={{ display: 'grid', gridTemplateColumns: '78px 62px 1fr', gap: '0.45rem', color: entry.level === 'MATCH' ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text-dim)' }}>[{entry.timestamp}]</span>
                  <span style={{ fontWeight: 800, color: entry.level === 'MATCH' ? 'var(--accent-teal)' : entry.level === 'ERROR' ? '#f87171' : 'var(--accent-cyan)' }}>{entry.level}</span>
                  <span style={{ color: '#dbeafe' }}>{entry.message}</span>
                </div>
              )) : (
                <div style={{ color: 'var(--text-dim)' }}>Waiting for backend scan events...</div>
              )}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
              Static analysis — uploaded code is not executed.
            </div>
          </div>

          {/* CURRENT ACTIVITY */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '1rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Current Activity</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                Analyzing: <strong style={{ color: '#ffffff' }}>{scanMetrics.current_file}</strong>
              </div>
            </div>

            {scanMetrics.current_algorithm && scanMetrics.current_algorithm !== 'N/A' && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Detected Primitive</div>
                <span style={{
                  display: 'inline-block',
                  marginTop: '0.2rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(6, 182, 212, 0.2)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {scanMetrics.current_algorithm}
                </span>
              </div>
            )}
          </div>

          {scanCompleted && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981' }}>
                  Static analysis complete.
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Review the completed scan here, then open Overview when you are ready.
                </div>
              </div>
              <button
                onClick={onOpenOverview}
                className="cyber-btn cyber-btn-primary"
                style={{ padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' }}
              >
                VIEW OVERVIEW →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD UPLOAD CONSOLE */
        <div className="cyber-card" style={{ padding: '2rem', border: '1px solid var(--border-light)' }}>
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: isDragging ? '2px dashed var(--accent-cyan)' : '2px dashed var(--border-light)',
              backgroundColor: isDragging ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".zip"
              style={{ display: 'none' }}
            />

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--accent-cyan)'
            }}>
              <UploadCloud size={32} />
            </div>

            {file ? (
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>
                  <FileArchive size={20} color="var(--accent-teal)" />
                  <span>{file.name}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for static discovery
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Upload Repository (.ZIP)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Drag & drop repository archive here or click to browse files
                </div>
              </div>
            )}
          </div>

          {/* Configuration & Action Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Repository Identifier / System Name (Optional)
              </label>
              <input
                type="text"
                className="cyber-input"
                style={{ width: '100%' }}
                placeholder="e.g. Enterprise Payment Microservice"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <button
              onClick={startScan}
              disabled={!file}
              className="cyber-btn cyber-btn-primary"
              style={{ padding: '0.65rem 1.85rem', height: '42px', opacity: !file ? 0.5 : 1 }}
            >
              <Play size={17} />
              <span>START SCAN</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.82rem',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Ingestion & Discovery Capabilities Grid */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              INGESTION PARAMETERS & SUPPORTED FORMATS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#ffffff' }}>Repository Archive:</strong> .ZIP format (Max 100MB)
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#ffffff' }}>Source Languages:</strong> Python (.py), Java (.java)
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#ffffff' }}>Manifests:</strong> requirements.txt, package.json, pom.xml
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#ffffff' }}>Config & Transport:</strong> JSON, YAML/YML, TLS/SSL configs
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.85rem' }}>
              <strong>Zero-Execution Guarantee:</strong> Uploaded software is analyzed strictly using static AST parsers and regex rules. Code is never imported, compiled, or executed.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
