import React, { useEffect, useMemo, useState } from 'react';
import { Atom, ShieldAlert, CheckCircle2, Eye, AlertTriangle, Clock } from 'lucide-react';
import { getInventory } from '../services/api';
import { EffortBadge } from '../components/Badge';

const THREAT_HORIZON_YEARS = 10;
const DATA_LIFETIME_YEARS = 10;

function migrationWeeks(item) {
  const value = String(item?.migration_time_estimate || '').toLowerCase();
  if (value.includes('6+')) return 8;
  if (value.includes('2–6') || value.includes('2-6')) return 4;
  if (value.includes('1–2') || value.includes('1-2')) return 1.5;
  return null;
}

function urgencyFor(item) {
  const weeks = migrationWeeks(item);
  if (weeks === null) return 'LOW URGENCY';
  const migrationYears = weeks / 52;
  const total = DATA_LIFETIME_YEARS + migrationYears;
  if (total > THREAT_HORIZON_YEARS) return 'URGENT MIGRATION';
  if (total > THREAT_HORIZON_YEARS - 2) return 'PLAN MIGRATION';
  return 'LOW URGENCY';
}

function urgencyTone(status) {
  if (status === 'URGENT MIGRATION') return { color: '#f87171', bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.35)' };
  if (status === 'PLAN MIGRATION') return { color: '#fbbf24', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.35)' };
  return { color: '#34d399', bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.35)' };
}

function MoscaScatter({ candidates }) {
  const width = 760;
  const height = 390;
  const left = 68;
  const right = 24;
  const top = 28;
  const bottom = 54;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const xMax = Math.max(12, DATA_LIFETIME_YEARS + 2);
  const yMax = 8;

  const pointX = (x) => left + (x / xMax) * plotW;
  const pointY = (y) => top + plotH - (y / yMax) * plotH;

  // Boundary: X + Y = Z. With X on the x-axis and Y on the y-axis.
  const boundaryStartX = Math.max(0, THREAT_HORIZON_YEARS - yMax);
  const boundaryEndX = Math.min(xMax, THREAT_HORIZON_YEARS);
  const boundary = `M ${pointX(boundaryStartX)} ${pointY(THREAT_HORIZON_YEARS - boundaryStartX)} L ${pointX(boundaryEndX)} ${pointY(THREAT_HORIZON_YEARS - boundaryEndX)}`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '620px', display: 'block' }} role="img" aria-label="Mosca urgency scatter plot">
        {[0, 2, 4, 6, 8, 10, 12].map((x) => (
          <g key={`x-${x}`}>
            <line x1={pointX(x)} y1={top} x2={pointX(x)} y2={top + plotH} stroke="rgba(148,163,184,.14)" />
            <text x={pointX(x)} y={height - 30} fill="#94a3b8" fontSize="12" textAnchor="middle">{x}</text>
          </g>
        ))}
        {[0, 2, 4, 6, 8].map((y) => (
          <g key={`y-${y}`}>
            <line x1={left} y1={pointY(y)} x2={left + plotW} y2={pointY(y)} stroke="rgba(148,163,184,.14)" />
            <text x={left - 12} y={pointY(y) + 4} fill="#94a3b8" fontSize="12" textAnchor="end">{y}</text>
          </g>
        ))}
        <line x1={left} y1={top + plotH} x2={left + plotW} y2={top + plotH} stroke="#64748b" />
        <line x1={left} y1={top} x2={left} y2={top + plotH} stroke="#64748b" />
        <path d={boundary} fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="7 6" />
        <text x={pointX(THREAT_HORIZON_YEARS) - 6} y={pointY(0) - 10} fill="#c084fc" fontSize="12" textAnchor="end">Urgency boundary: X + Y = {THREAT_HORIZON_YEARS} yrs</text>

        {candidates.map((item, index) => {
          const weeks = migrationWeeks(item);
          const y = weeks === null ? 0.5 : Math.max(0.5, weeks / 52);
          const status = urgencyFor(item);
          const tone = urgencyTone(status);
          const x = DATA_LIFETIME_YEARS;
          const cx = pointX(x);
          const cy = pointY(Math.min(yMax, y));
          return (
            <g key={item.id || `${item.algorithm}-${index}`}>
              <circle cx={cx} cy={cy} r="8" fill={tone.color} opacity="0.92" />
              <circle cx={cx} cy={cy} r="13" fill="none" stroke={tone.color} opacity="0.22" />
              <text x={cx + 12} y={cy - 8} fill="#f8fafc" fontSize="12" fontWeight="700">{item.algorithm}</text>
            </g>
          );
        })}
        <text x={left + plotW / 2} y={height - 8} fill="#cbd5e1" fontSize="13" fontWeight="700" textAnchor="middle">Data Lifetime (Years)</text>
        <text x="16" y={top + plotH / 2} fill="#cbd5e1" fontSize="13" fontWeight="700" textAnchor="middle" transform={`rotate(-90 16 ${top + plotH / 2})`}>Migration Time (Years)</text>
      </svg>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className="cyber-card" style={{ padding: '1rem' }}>
      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: '.35rem', fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 900, color: tone }}>{value}</div>
    </div>
  );
}

export function RiskMoscaPage({ scanId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      if (!scanId) return;
      try {
        setItems(await getInventory(scanId));
      } catch (err) {
        setItems([]);
      }
    }
    load();
  }, [scanId]);

  const candidates = useMemo(() => items.filter((item) => item.pqc_migration_candidate === 'Candidate'), [items]);
  const urgent = candidates.filter((item) => urgencyFor(item) === 'URGENT MIGRATION');
  const plan = candidates.filter((item) => urgencyFor(item) === 'PLAN MIGRATION');
  const low = candidates.filter((item) => urgencyFor(item) === 'LOW URGENCY');
  const highestPriority = urgent[0] || plan[0] || candidates[0] || null;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.35rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-purple)', fontSize: '.85rem' }}>04 RISK / MOSCA</span>
          <span style={{ color: 'var(--border-light)' }}>•</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>Quantum Exposure Engine</h1>
        </div>
        <p style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Simple urgency, quantum exposure, and migration prioritization using the repository's actual cryptographic findings.</p>
      </div>

      <div className="cyber-card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem' }}>
          <Clock size={18} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Mosca's Theorem Urgency Model</h3>
        </div>
        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
          Data lifetime + migration time is compared with the configured prototype threat horizon. Assets beyond the boundary need urgent attention.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '.65rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '.75rem' }}>
            <div style={{ fontSize: '.68rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>X • DATA LIFETIME</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>{DATA_LIFETIME_YEARS} years</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '.75rem' }}>
            <div style={{ fontSize: '.68rem', color: 'var(--accent-teal)', fontWeight: 800 }}>Y • MIGRATION TIME</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>From scan</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '.75rem' }}>
            <div style={{ fontSize: '.68rem', color: 'var(--accent-purple)', fontWeight: 800 }}>Z • THREAT HORIZON</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>{THREAT_HORIZON_YEARS} years</div>
          </div>
        </div>
        <div style={{ background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.25)', borderRadius: '8px', padding: '.7rem .8rem', fontSize: '.72rem', color: 'var(--text-muted)' }}>
          Planning assumption: X and Z retain the prototype values used by the existing model; Y is derived from each detected artefact's actual migration-time estimate. This is a planning visualization, not a prediction of quantum arrival.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <SummaryCard label="Urgent" value={urgent.length} tone="#f87171" />
        <SummaryCard label="Plan" value={plan.length} tone="#fbbf24" />
        <SummaryCard label="Low Urgency" value={low.length} tone="#34d399" />
      </div>

      <div className="cyber-card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
        <div style={{ marginBottom: '.8rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Mosca's Theorem Urgency Model</h3>
          <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Data Lifetime vs Migration Time</p>
        </div>
        {candidates.length ? <MoscaScatter candidates={candidates} /> : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No PQC migration candidates were identified in the completed scan.</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="cyber-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.9rem' }}>
            <Atom size={19} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Quantum Threats — In Simple Terms</h3>
          </div>
          <div style={{ display: 'grid', gap: '.65rem' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '.8rem' }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '.82rem' }}>SHOR'S ALGORITHM</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '.74rem', marginTop: '.25rem' }}>Public-key cryptography such as RSA and ECC is vulnerable to sufficiently capable quantum computers.</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '.8rem' }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '.82rem' }}>GROVER'S ALGORITHM</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '.74rem', marginTop: '.25rem' }}>Symmetric cryptography experiences a lower level of quantum speedup than public-key cryptography.</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '.8rem' }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '.82rem' }}>HNDL</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '.74rem', marginTop: '.25rem' }}>Encrypted information captured today may be targeted for future decryption if the underlying cryptography becomes vulnerable.</div>
            </div>
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.9rem' }}>
            <Eye size={19} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Highest Priority</h3>
          </div>
          {highestPriority ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#fff', fontSize: '1.2rem' }}>{highestPriority.algorithm}</div>
                <span style={{ fontSize: '.68rem', fontWeight: 900, padding: '.2rem .5rem', borderRadius: '999px', color: urgencyTone(urgencyFor(highestPriority)).color, background: urgencyTone(urgencyFor(highestPriority)).bg, border: `1px solid ${urgencyTone(urgencyFor(highestPriority)).border}` }}>{urgencyFor(highestPriority)}</span>
              </div>
              <div style={{ marginTop: '.8rem', color: 'var(--text-muted)', fontSize: '.76rem', lineHeight: 1.5 }}>
                <strong style={{ color: '#fff' }}>Why:</strong> {highestPriority.reason || 'Priority derived from the completed scan result.'}
              </div>
              <div style={{ marginTop: '.8rem', fontSize: '.72rem', color: 'var(--text-dim)' }}>Source: {highestPriority.file}:{highestPriority.line}</div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>Calculating from completed scan results.</div>
          )}
        </div>
      </div>

      <div className="cyber-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.9rem' }}>
          <AlertTriangle size={19} color="#fbbf24" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Post-Quantum Migration Candidates</h3>
          <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--accent-purple)', fontWeight: 800 }}>{candidates.length} detected</span>
        </div>
        <div style={{ display: 'grid', gap: '.65rem' }}>
          {candidates.length ? candidates.map((item) => {
            const status = urgencyFor(item);
            const tone = urgencyTone(status);
            return (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr .8fr 1fr', gap: '.75rem', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '.75rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fff' }}>{item.algorithm}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-dim)' }}>{item.file}:{item.line}</div>
                </div>
                <div><div style={{ fontSize: '.62rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Current risk</div><div style={{ fontSize: '.74rem', color: '#fff', fontWeight: 800 }}>{item.severity}</div></div>
                <div><div style={{ fontSize: '.62rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Quantum risk</div><div style={{ fontSize: '.74rem', color: '#fff', fontWeight: 800 }}>{item.quantum_risk}</div></div>
                <div style={{ textAlign: 'right' }}><span style={{ display: 'inline-block', padding: '.22rem .5rem', borderRadius: '999px', color: tone.color, background: tone.bg, border: `1px solid ${tone.border}`, fontSize: '.65rem', fontWeight: 900 }}>{status}</span><div style={{ marginTop: '.3rem' }}><EffortBadge effort={item.migration_effort} timeEstimate={item.migration_time_estimate} /></div></div>
              </div>
            );
          }) : <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No post-quantum migration candidates were detected.</div>}
        </div>
      </div>
    </div>
  );
}
