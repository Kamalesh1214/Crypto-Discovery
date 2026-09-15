import React, { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  Atom, 
  ShieldCheck, 
  Code, 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode2, 
  Copy, 
  Check,
  Info
} from 'lucide-react';
import { getInventory } from '../services/api';
import { SeverityBadge, ExposureBadge, PqcBadge, EffortBadge } from '../components/Badge';

export function MigrationPage({ scanId, scan }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!scanId) return;
      try {
        setLoading(true);
        const data = await getInventory(scanId);
        setItems(data);
        // Default select an asymmetric candidate or critical/high finding
        const candidate = data.find((i) => i.pqc_migration_candidate === 'Candidate') || data[0];
        setSelectedItem(candidate || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [scanId]);

  const copyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate realistic prototype remediation wrapper based on algorithm
  const getPrototypeRemediation = (item) => {
    if (!item) return { title: 'N/A', code: '// No item selected', considerations: [] };

    const algo = item.algorithm.toUpperCase();

    if (algo.includes('RSA') || algo.includes('EC') || algo.includes('ED25519')) {
      return {
        title: `Hybrid Quantum-Safe KEM / Signature Wrapper for ${item.algorithm}`,
        standard: 'NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)',
        code: `# Prototype Remediation: Quantum-Resistant Hybrid Wrapper
# Clearly designated as a Prototype Architecture Pattern (does not modify production code)

from typing import Tuple

# Step 1: Classical Primitive (${item.algorithm}) combined with Post-Quantum Algorithm (ML-KEM-768)
class HybridKEMWrapper:
    """
    Implements a hybrid key encapsulation mechanism combining classical ${item.algorithm} 
    with NIST FIPS 203 ML-KEM-768 for quantum forward secrecy.
    """
    def __init__(self):
        self.classical_algorithm = "${item.algorithm}"
        self.pqc_algorithm = "ML-KEM-768 (NIST FIPS 203)"

    def encapsulate(self, public_key_bundle: bytes) -> Tuple[bytes, bytes]:
        # Generate shared secret using dual encapsulation:
        # shared_secret = KDF(classical_secret || pqc_secret)
        # Prevents 'Harvest Now, Decrypt Later' (HNDL) attacks
        pass

    def decapsulate(self, ciphertext_bundle: bytes, private_key: bytes) -> bytes:
        # Both classical and post-quantum layers must succeed
        pass`,
        considerations: [
          'Key Size Expansion: ML-KEM-768 public keys and ciphertexts are significantly larger than RSA-2048 (~1184 bytes vs 256 bytes).',
          'API Contract Updates: Communications protocols must negotiate hybrid public key bundles.',
          'Regression Testing: Benchmark latency impact on TLS handshakes and microservice token generation.'
        ],
        testing: [
          'Verify backward compatibility with legacy endpoints supporting only classical RSA/ECC.',
          'Execute fuzzing tests on ciphertext parsing to prevent side-channel leakage.',
          'Validate dual-secret KDF entropy distribution under standard KAT (Known Answer Test) vectors.'
        ]
      };
    }

    if (algo === 'DES' || algo === '3DES' || algo === 'RC4') {
      return {
        title: `Authenticated Modern Symmetric Replacement for ${item.algorithm}`,
        standard: 'NIST SP 800-38D (AES-256-GCM)',
        code: `# Prototype Remediation: Upgrade from ${item.algorithm} to AES-256-GCM
# Replaces broken/deprecated symmetric ciphers with authenticated encryption

from Crypto.Cipher import AES
import secrets

def encrypt_authenticated_payload(plaintext: bytes, secret_key: bytes) -> Tuple[bytes, bytes, bytes]:
    """
    Replaces obsolete ${item.algorithm} with AES-256 in Galois/Counter Mode (GCM).
    Guarantees both confidentiality and ciphertext tamper resistance.
    """
    # 256-bit symmetric key provides robust classical and 128-bit quantum protection
    nonce = secrets.token_bytes(12)  # 96-bit unique IV
    cipher = AES.new(secret_key, AES.MODE_GCM, nonce=nonce)
    ciphertext, auth_tag = cipher.encrypt_and_digest(plaintext)
    return nonce, ciphertext, auth_tag`,
        considerations: [
          'Nonce Uniqueness: Under AES-GCM, never reuse a nonce with the same key (catastrophic authenticity loss).',
          'Data Re-encryption: All stored payloads encrypted with legacy ${item.algorithm} must be batch re-encrypted.',
          'Key Rotation: Deprecate existing 56-bit / 64-bit keys in favor of 256-bit secure KMS keys.'
        ],
        testing: [
          'Verify authentication tag validation rejects modified ciphertexts.',
          'Test data migration pipeline across test database backups.',
          'Validate memory scrubbing of secret keys after encryption operations.'
        ]
      };
    }

    if (algo === 'MD5' || algo === 'SHA-1') {
      return {
        title: `Collision-Resistant Hash Migration for ${item.algorithm}`,
        standard: 'FIPS 180-4 (SHA-256) / RFC 9106 (Argon2id)',
        code: `# Prototype Remediation: Upgrade from ${item.algorithm} to SHA-256 / Argon2id
# Resolves cryptanalytic collision attacks and credential cracking vulnerabilities

import hashlib

def secure_digest(data: bytes) -> str:
    """
    Replaces collision-broken ${item.algorithm} with SHA-256 for integrity verification.
    For password hashing, transition to Argon2id or bcrypt instead of raw digests.
    """
    return hashlib.sha256(data).hexdigest()`,
        considerations: [
          'Password Storage: If ${item.algorithm} was used for passwords, upgrade immediately to Argon2id or PBKDF2.',
          'Digest Length: SHA-256 outputs 32 bytes (64 hex characters), which may require database schema expansion.',
          'Signature Verification: Any external digital signature certificates using ${item.algorithm} must be reissued.'
        ],
        testing: [
          'Run regression tests on integrity verification pipelines.',
          'Validate transparent re-hashing of legacy user passwords upon next login.'
        ]
      };
    }

    return {
      title: `Modern Cryptographic Best Practice for ${item.algorithm}`,
      standard: 'NIST Standards & Cryptographic Agility',
      code: `# Prototype Remediation Pattern for ${item.algorithm}
# Ensure cryptographic agility by isolating algorithm bindings behind service interfaces

class CryptographicService:
    def process(self, data: bytes) -> bytes:
        # Standardize modern cryptographic routines
        pass`,
      considerations: ['Verify key lengths and library patch versions.'],
      testing: ['Execute unit tests and performance benchmarks.']
    };
  };

  const remediation = getPrototypeRemediation(selectedItem);

  return (
    <div className="page-wrapper">
      {/* Module Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
            06 MIGRATION
          </span>
          <span style={{ color: 'var(--border-light)' }}>•</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>
            Hybrid Remediation Workbench
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Practical developer guidance, hybrid post-quantum transition blueprints, and prototype remediation wrappers
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading remediation workbench...
        </div>
      ) : items.length === 0 ? (
        <div className="cyber-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No cryptographic items available for remediation planning.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Left Column: Remediable Items List */}
          <div className="cyber-card" style={{ padding: '1rem', maxHeight: '720px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              REMEDIATION CANDIDATES ({items.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {items.map((it) => {
                const isSelected = selectedItem && selectedItem.id === it.id;
                const isPqc = it.pqc_migration_candidate === 'Candidate';

                return (
                  <button
                    key={it.id}
                    onClick={() => setSelectedItem(it)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-secondary)',
                      border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                        {it.algorithm}
                      </span>
                      <SeverityBadge severity={it.severity} />
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.file}:{it.line}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      {isPqc && <PqcBadge candidate={it.pqc_migration_candidate} />}
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-teal)' }}>{it.migration_time_estimate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Workbench Guidance & Prototype Code */}
          {selectedItem && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Remediation Profile Card */}
              <div className="cyber-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {selectedItem.algorithm}
                    </span>
                    <SeverityBadge severity={selectedItem.severity} />
                    <PqcBadge candidate={selectedItem.pqc_migration_candidate} />
                  </div>

                  <EffortBadge effort={selectedItem.migration_effort} timeEstimate={selectedItem.migration_time_estimate} />
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
                  Location: {selectedItem.file}:{selectedItem.line}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Current Usage</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{selectedItem.reason}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Recommended Direction</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-teal)', marginTop: '0.2rem', fontWeight: 600 }}>{selectedItem.recommendation}</div>
                  </div>
                </div>

                {/* Prototype Remediation Code Wrapper */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
                      <Code size={16} color="var(--accent-cyan)" />
                      <span>{remediation.title}</span>
                    </div>

                    <button
                      onClick={() => copyCode(remediation.code)}
                      className="cyber-btn cyber-btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                    >
                      {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy Blueprint'}</span>
                    </button>
                  </div>

                  <div className="code-snippet" style={{ maxHeight: '240px' }}>
                    {remediation.code}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                    Disclaimer: Prototype remediation blueprints are instructional architecture patterns and do not modify production code automatically.
                  </div>
                </div>

                {/* Compatibility & Testing Considerations */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Lightbulb size={15} color="var(--accent-cyan)" />
                      <span>COMPATIBILITY CONSIDERATIONS</span>
                    </div>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {remediation.considerations.map((c, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={15} color="var(--accent-teal)" />
                      <span>TESTING & VERIFICATION</span>
                    </div>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {remediation.testing.map((t, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
