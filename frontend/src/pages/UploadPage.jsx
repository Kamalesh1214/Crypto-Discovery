import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileArchive, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Play
} from 'lucide-react';
import { uploadAndScan } from '../services/api';

export function UploadPage({ onScanComplete }) {
  const [file, setFile] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [stage, setStage] = useState(0); // 0: Idle, 1: Uploading, 2: Discovering, 3: Analyzing, 4: Assessing, 5: Generating Report
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const stages = [
    'UPLOAD',
    'DISCOVER',
    'ANALYZE',
    'ASSESS',
    'GENERATE REPORT'
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.zip')) {
        setError('Please select a valid .ZIP archive file.');
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
        setError('Please upload a valid .ZIP file.');
        return;
      }
      setFile(dropped);
      setError(null);
      if (!projectName) {
        setProjectName(dropped.name.replace(/\.zip$/i, ''));
      }
    }
  };

  const executeScan = async () => {
    if (!file) {
      setError('Please select or drop a .ZIP file to analyze.');
      return;
    }

    setError(null);
    setStage(1);

    // Progression timer simulation for visual delight while backend executes
    const interval = setInterval(() => {
      setStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const result = await uploadAndScan(file, projectName);
      clearInterval(interval);
      setStage(5);
      setTimeout(() => {
        onScanComplete(result);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setStage(0);
      setError(err.message || 'Scan failed to complete.');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '840px', marginTop: '1.5rem' }}>
      {/* Title & Introduction */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.35rem 0.85rem', 
          borderRadius: '9999px',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--accent-cyan)',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          <ShieldCheck size={16} />
          <span>SIH 2026 Problem Statement SIH26164</span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: '0.5rem' }}>
          Cryptographic Discovery
        </h1>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--accent-teal)', fontWeight: 600, marginBottom: '1rem' }}>
          Cryptographic Discovery & Security Analyzer
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '580px', margin: '0 auto' }}>
          Analyze your software repository for cryptographic usage, security weaknesses, potential data exposure, and post-quantum migration readiness without executing uploaded code.
        </p>
      </div>

      {/* Upload Box */}
      <div className="cyber-card" style={{ padding: '2rem', border: '1px solid var(--border-light)' }}>
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
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                Choose ZIP Project or drag & drop here
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Supports Python, Java, and dependency manifests (max 100MB)
              </div>
            </div>
          )}
        </div>

        {/* Project Name Input */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Project / Repository Label (Optional)
            </label>
            <input
              type="text"
              className="cyber-input"
              style={{ width: '100%' }}
              placeholder="e.g. Enterprise Payment Microservice"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={stage > 0}
            />
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={executeScan}
              disabled={stage > 0 || !file}
              className="cyber-btn cyber-btn-primary"
              style={{ padding: '0.65rem 1.75rem', height: '42px', opacity: !file || stage > 0 ? 0.6 : 1 }}
            >
              {stage > 0 ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Start Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notification */}
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

        {/* Scanner Pipeline Progression Stages */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Analysis Pipeline Execution
          </div>

          <div className="stepper-container">
            {stages.map((st, idx) => {
              const stepIndex = idx + 1;
              const isActive = stage === stepIndex;
              const isDone = stage > stepIndex;

              return (
                <div 
                  key={idx} 
                  className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                >
                  {isDone ? (
                    <CheckCircle2 size={14} color="var(--accent-teal)" />
                  ) : isActive ? (
                    <Loader2 size={14} className="animate-spin" color="var(--accent-cyan)" />
                  ) : (
                    <span style={{ fontSize: '0.7rem' }}>{stepIndex}</span>
                  )}
                  <span>{st}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
