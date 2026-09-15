const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export async function uploadAndScan(file, projectName, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  if (projectName) {
    formData.append('project_name', projectName);
  }

  // Initiate scan with background=true for real-time progress tracking
  const res = await fetch(`${API_BASE}/scan?background=true`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = 'Upload failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch (e) {}
    throw new Error(errorDetail);
  }

  const initialData = await res.json();
  const scanId = initialData.id || initialData.scan_id;

  // Poll real backend scan status
  return new Promise((resolve, reject) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await fetch(`${API_BASE}/scan/${scanId}/status`);
        if (!statusRes.ok) {
          throw new Error('Failed to query scan status');
        }
        const statusData = await statusRes.json();

        if (onProgress) {
          onProgress(statusData);
        }

        if (statusData.status === 'completed') {
          clearInterval(pollInterval);
          // Fetch final completed scan object
          const finalScan = await getScan(scanId);
          resolve(finalScan);
        } else if (statusData.status === 'failed') {
          clearInterval(pollInterval);
          reject(new Error(statusData.error || 'Scan encountered an error during analysis.'));
        }
      } catch (err) {
        clearInterval(pollInterval);
        reject(err);
      }
    }, 280);
  });
}

export async function getScanStatus(scanId) {
  const res = await fetch(`${API_BASE}/scan/${scanId}/status`);
  if (!res.ok) throw new Error('Failed to fetch scan status');
  return await res.json();
}

export async function listScans() {
  const res = await fetch(`${API_BASE}/scans`);
  if (!res.ok) throw new Error('Failed to fetch scans');
  return await res.json();
}

export async function getScan(scanId) {
  const res = await fetch(`${API_BASE}/scan/${scanId}`);
  if (!res.ok) throw new Error('Failed to fetch scan details');
  return await res.json();
}

export async function getInventory(scanId) {
  const res = await fetch(`${API_BASE}/scan/${scanId}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch cryptographic inventory');
  return await res.json();
}

export async function getFindings(scanId, filters = {}) {
  const params = new URLSearchParams();
  if (filters.severity) params.append('severity', filters.severity);
  if (filters.exposure) params.append('exposure', filters.exposure);
  if (filters.pqc_candidate) params.append('pqc_candidate', filters.pqc_candidate);

  const res = await fetch(`${API_BASE}/scan/${scanId}/findings?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch findings');
  return await res.json();
}

export function getJsonReportUrl(scanId) {
  return `${API_BASE}/scan/${scanId}/report/json`;
}

export function getCsvReportUrl(scanId) {
  return `${API_BASE}/scan/${scanId}/report/csv`;
}
