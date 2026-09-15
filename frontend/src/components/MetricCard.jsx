import React from 'react';

export function MetricCard({ title, value, description, icon: Icon, valueColor, badge }) {
  return (
    <div className="metric-card">
      <div className="metric-title">
        <span>{title}</span>
        {Icon && <Icon size={18} color="var(--accent-cyan)" />}
      </div>
      <div className="metric-value" style={{ color: valueColor || 'var(--text-main)' }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="metric-desc">{description}</span>
        {badge}
      </div>
    </div>
  );
}
