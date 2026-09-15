import React, { useState, useEffect } from 'react';
import { Search, Filter, Database, ArrowUpDown, Eye, ShieldAlert } from 'lucide-react';
import { getInventory } from '../services/api';
import { SeverityBadge, ExposureBadge, PqcBadge, EffortBadge } from '../components/Badge';
import { FindingDetailModal } from '../components/FindingDetailModal';

export function InventoryPage({ scanId }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [exposureFilter, setExposureFilter] = useState('ALL');
  const [pqcFilter, setPqcFilter] = useState('ALL');
  const [selectedFinding, setSelectedFinding] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!scanId) return;
      try {
        setLoading(true);
        const data = await getInventory(scanId);
        setItems(data);
        setFilteredItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [scanId]);

  // Handle Filtering & Search
  useEffect(() => {
    let result = items;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (it) =>
          it.algorithm.toLowerCase().includes(q) ||
          it.file.toLowerCase().includes(q) ||
          it.library.toLowerCase().includes(q) ||
          it.type.toLowerCase().includes(q)
      );
    }

    if (severityFilter !== 'ALL') {
      result = result.filter((it) => it.severity.toUpperCase() === severityFilter);
    }

    if (exposureFilter !== 'ALL') {
      result = result.filter((it) => it.potential_exposure.toUpperCase() === exposureFilter);
    }

    if (pqcFilter !== 'ALL') {
      result = result.filter((it) => it.pqc_migration_candidate === pqcFilter);
    }

    setFilteredItems(result);
  }, [search, severityFilter, exposureFilter, pqcFilter, items]);

  return (
    <div className="page-wrapper">
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            Cryptographic Inventory
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            CBOM-ready catalogue of all discovered cryptographic algorithms, libraries, modes, and keys
          </p>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
          {filteredItems.length} of {items.length} Artefacts
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="cyber-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="cyber-input"
            style={{ width: '100%', paddingLeft: '2rem' }}
            placeholder="Search by algorithm, file, library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Severity Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Severity:</label>
          <select 
            className="cyber-input"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Exposure Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Exposure:</label>
          <select 
            className="cyber-input"
            value={exposureFilter}
            onChange={(e) => setExposureFilter(e.target.value)}
          >
            <option value="ALL">All Exposures</option>
            <option value="VERY HIGH">Very High</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* PQC Candidate Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PQC:</label>
          <select 
            className="cyber-input"
            value={pqcFilter}
            onChange={(e) => setPqcFilter(e.target.value)}
          >
            <option value="ALL">All PQC Status</option>
            <option value="Candidate">Candidate</option>
            <option value="Not Immediate">Not Immediate</option>
            <option value="Not Required">Not Required</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="cyber-table-container">
        <table className="cyber-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Type / Library</th>
              <th>File</th>
              <th>Severity</th>
              <th>Exposure</th>
              <th>PQC Readiness</th>
              <th>Migration Effort</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading cryptographic inventory...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No cryptographic artefacts match your search filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr 
                  key={item.id}
                  onClick={() => setSelectedFinding(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {item.algorithm}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{item.type}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{item.library}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                    {item.file}:{item.line}
                  </td>
                  <td>
                    <SeverityBadge severity={item.severity} />
                  </td>
                  <td>
                    <ExposureBadge level={item.potential_exposure} />
                  </td>
                  <td>
                    <PqcBadge candidate={item.pqc_migration_candidate} />
                  </td>
                  <td>
                    <EffortBadge effort={item.migration_effort} timeEstimate={item.migration_time_estimate} />
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFinding(item);
                      }}
                      className="cyber-btn cyber-btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Finding Detail Modal Drawer */}
      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </div>
  );
}
