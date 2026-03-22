'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { API_CONFIG } from '@rural-ai/shared';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  QrCode,
  ScanLine,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  FileText,
  Copy,
} from 'lucide-react';

type Tab = 'generate' | 'scan';

export default function QRSharePage() {
  const [tab, setTab] = useState<Tab>('generate');
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">QR Record Sharing</h1>
        <p className="text-muted-foreground text-sm">
          Share patient records securely via time-limited QR codes. No medical data is stored in the QR itself.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('generate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'generate'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Generate QR
        </button>
        <button
          onClick={() => setTab('scan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'scan'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <ScanLine className="w-4 h-4" />
          Verify QR
        </button>
      </div>

      {tab === 'generate' ? <GenerateTab /> : <VerifyTab />}
    </div>
  );
}

// ── Generate Tab ────────────────────────────────────────────────────

function GenerateTab() {
  const [subjectId, setSubjectId] = useState('');
  const [subjectType, setSubjectType] = useState<'patient' | 'health_log'>('patient');
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setQrPayload(null);

    if (!subjectId.trim()) {
      setError('Please enter a record ID.');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.BASE_URL;
      const res = await fetch(`${apiBase}/api/qr/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id: subjectId.trim(),
          subject_type: subjectType,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.detail || 'Failed to generate QR code.');
        return;
      }

      setQrPayload(json.qr_payload);
    } catch (err) {
      setError('Failed to generate QR code. Check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Generate Sharing QR</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Record Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['patient', 'health_log'] as const).map((typ) => (
                <button
                  key={typ}
                  type="button"
                  onClick={() => setSubjectType(typ)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                    subjectType === typ
                      ? 'bg-primary/10 text-primary border-primary ring-1 ring-primary'
                      : 'bg-background text-muted-foreground border-input hover:border-primary/50'
                  }`}
                >
                  {typ === 'patient' ? <User className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  {typ === 'patient' ? 'Patient' : 'Health Log'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {subjectType === 'patient' ? 'Patient' : 'Health Log'} ID
            </label>
            <input
              type="text"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="UUID of the record"
              className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all text-sm"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate QR Code'
            )}
          </button>
        </form>
      </div>

      {qrPayload && (
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">Scan this QR Code</h2>
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <QRCodeSVG value={qrPayload} size={220} level="M" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Expires in 10 minutes
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(qrPayload)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
          >
            <Copy className="w-4 h-4" />
            Copy payload
          </button>
        </div>
      )}
    </div>
  );
}

// ── Verify Tab ──────────────────────────────────────────────────────

function VerifyTab() {
  const [payload, setPayload] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [record, setRecord] = useState<{ type: string; record: Record<string, unknown> } | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setRecord(null);

    if (!payload.trim()) {
      setError('Paste the QR payload to verify.');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError('Not authenticated.');
        setLoading(false);
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.BASE_URL;
      const res = await fetch(`${apiBase}/api/qr/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_payload: payload.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.detail || 'Verification failed.');
        return;
      }

      setRecord({ type: json.type, record: json.record });
    } catch (err) {
      setError('Verification failed. Check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6 max-w-xl">
        <h2 className="text-lg font-semibold text-foreground mb-4">Verify QR Code</h2>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              QR Payload (JSON)
            </label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder='Paste the scanned QR payload here...'
              rows={4}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all text-sm font-mono"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              'Verify & Fetch Record'
            )}
          </button>
        </form>
      </div>

      {record && (
        <div className="bg-card rounded-xl border border-border p-6 max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-foreground">
              Verified {record.type === 'patient' ? 'Patient' : 'Health Log'} Record
            </h3>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-foreground whitespace-pre-wrap">
              {JSON.stringify(record.record, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
