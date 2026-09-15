import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle, Shield, Atom } from 'lucide-react';

export function SeverityBadge({ severity }) {
  const s = (severity || 'WARNING').toUpperCase();

  if (s === 'CRITICAL') {
    return (
      <span className="badge badge-critical">
        <ShieldAlert size={12} /> CRITICAL
      </span>
    );
  }
  if (s === 'HIGH') {
    return (
      <span className="badge badge-high">
        <AlertTriangle size={12} /> HIGH
      </span>
    );
  }
  if (s === 'MEDIUM') {
    return (
      <span className="badge badge-medium">
        <AlertCircle size={12} /> MEDIUM
      </span>
    );
  }
  if (s === 'LOW') {
    return (
      <span className="badge badge-low">
        <CheckCircle size={12} /> LOW
      </span>
    );
  }
  if (s === 'INFORMATIONAL' || s === 'INFO') {
    return (
      <span className="badge badge-info">
        <Shield size={12} /> INFO
      </span>
    );
  }
  return (
    <span className="badge badge-medium">
      <AlertCircle size={12} /> {s}
    </span>
  );
}

export function ExposureBadge({ level }) {
  const l = (level || 'UNKNOWN').toUpperCase();

  if (l === 'VERY HIGH') {
    return <span className="badge badge-critical">VERY HIGH</span>;
  }
  if (l === 'HIGH') {
    return <span className="badge badge-high">HIGH</span>;
  }
  if (l === 'MEDIUM') {
    return <span className="badge badge-medium">MEDIUM</span>;
  }
  if (l === 'LOW') {
    return <span className="badge badge-low">LOW</span>;
  }
  return <span className="badge badge-info">UNKNOWN</span>;
}

export function PqcBadge({ candidate }) {
  const c = candidate || 'Unknown';
  if (c === 'Candidate') {
    return (
      <span className="badge badge-quantum">
        <Atom size={12} /> PQC Candidate
      </span>
    );
  }
  if (c === 'Not Immediate') {
    return (
      <span className="badge badge-medium">
        Not Immediate
      </span>
    );
  }
  return (
    <span className="badge badge-low">
      Not Required
    </span>
  );
}

export function EffortBadge({ effort, timeEstimate }) {
  const e = (effort || 'UNKNOWN').toUpperCase();
  const label = timeEstimate && timeEstimate !== 'Unknown' ? timeEstimate : e;

  if (e === 'HIGH') {
    return <span className="badge badge-critical">{label}</span>;
  }
  if (e === 'MEDIUM') {
    return <span className="badge badge-high">{label}</span>;
  }
  if (e === 'LOW') {
    return <span className="badge badge-cyan">{label}</span>;
  }
  if (e === 'NOT REQUIRED') {
    return <span className="badge badge-low">Not Required</span>;
  }
  return <span className="badge badge-info">{label}</span>;
}
