'use client';

import { useState, useRef } from 'react';
import { scanPrescription, type PrescriptionResult, type PrescriptionMedicine } from '@/lib/aiService';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { getSession } from '@/lib/auth';
import {
  Upload,
  ScanLine,
  Info,
  Pill,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type ScanState = 'idle' | 'scanning' | 'done' | 'error';

function MedicineCard({ med }: { med: PrescriptionMedicine }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border p-5 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
            <Pill className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{med.name}</h4>
            {med.generic_name && med.generic_name !== med.name && (
              <p className="text-xs text-muted-foreground">Generic: {med.generic_name}</p>
            )}
          </div>
        </div>
        {med.found_in_db && (
          <span className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            In DB
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-2 mb-3 ml-11">
        {med.dosage} · {med.frequency} · {med.duration}
      </p>

      {(med.market_price > 0 || med.jan_aushadhi_price > 0) && (
        <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5 border border-border/50 ml-11">
          {med.market_price > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Market Price</span>
              <span className="text-foreground line-through decoration-destructive/50">&#8377;{med.market_price.toFixed(0)}</span>
            </div>
          )}
          {med.jan_aushadhi_price > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-primary font-medium">Jan Aushadhi</span>
              <span className="text-primary font-bold">&#8377;{med.jan_aushadhi_price.toFixed(0)}</span>
            </div>
          )}
          {med.savings_percent > 0 && (
            <div className="flex justify-between text-sm pt-1.5 border-t border-border/50">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">You save</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{med.savings_percent}%</span>
            </div>
          )}
        </div>
      )}

      {med.jan_aushadhi_name && med.jan_aushadhi_name !== med.name && (
        <p className="text-xs text-muted-foreground mt-2 ml-11">
          Jan Aushadhi: {med.jan_aushadhi_name}
        </p>
      )}

      {/* Expandable details */}
      {(med.uses?.length > 0 || med.side_effects?.length > 0) && (
        <div className="mt-3 ml-11">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide details' : 'Show uses & side effects'}
          </button>
          {expanded && (
            <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {med.uses?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground">Uses:</p>
                  <p className="text-xs text-muted-foreground">{med.uses.join(', ')}</p>
                </div>
              )}
              {med.side_effects?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground">Side effects:</p>
                  <p className="text-xs text-muted-foreground">{med.side_effects.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PrescriptionScannerPage() {
  const user = getSession();
  const { t } = useLanguage();
  const [state, setState] = useState<ScanState>('idle');
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setState('scanning');
    setErrorMsg('');

    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) throw new Error('You must be logged in to scan prescriptions.');

      const prescription = await scanPrescription(file, token);
      setResult(prescription);
      setState('done');
      setSaved(!!prescription.saved);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Scan failed. Make sure the API server is running.');
      setState('error');
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleReset() {
    setResult(null);
    setPreview(null);
    setState('idle');
    setErrorMsg('');
    setSaved(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{t('prescription.scanner')}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {t('prescription.scanDescription')}
      </p>

      {/* Idle: Upload area */}
      {state === 'idle' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-foreground font-semibold text-lg mb-1">{t('prescription.uploadPrescription')}</p>
            <p className="text-muted-foreground text-sm">
              {t('prescription.dragDrop')}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mt-6">
            <h3 className="text-primary font-bold mb-3 flex items-center gap-2 text-sm">
              <Info className="w-4 h-4" /> {t('prescription.howItWorks')}
            </h3>
            <div className="space-y-2 text-sm text-foreground/80">
              <p>1. Upload a photo of your prescription</p>
              <p>2. Local OCR extracts medicine names and dosages</p>
              <p>3. We look up Jan Aushadhi alternatives from our database</p>
              <p>4. See real price comparisons and savings</p>
            </div>
          </div>
        </div>
      )}

      {/* Scanning */}
      {state === 'scanning' && (
        <div className="text-center py-20 animate-in fade-in zoom-in duration-300">
          {preview && (
            <div className="relative inline-block mb-8">
              <img
                src={preview}
                alt="Prescription"
                className="w-48 h-48 object-cover rounded-xl shadow-lg border border-border"
              />
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                <ScanLine className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
          )}
          <p className="text-foreground font-semibold text-xl">{t('prescription.scanning')}</p>
          <p className="text-muted-foreground text-sm mt-2">{t('common.loading')}</p>
          <div className="mt-6 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="text-center py-16 animate-in fade-in duration-300">
          {preview && (
            <img
              src={preview}
              alt="Prescription"
              className="w-32 h-32 object-cover rounded-xl mx-auto mb-6 border border-border opacity-50 grayscale"
            />
          )}
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 mb-8 max-w-md mx-auto">
            <p className="text-destructive font-medium text-sm">{errorMsg}</p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t('prescription.tryAgain')}
          </button>
        </div>
      )}

      {/* Results */}
      {state === 'done' && result && (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          {/* Doctor info */}
          <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
            <div className="flex justify-between text-sm items-center border-b border-border/50 pb-3 mb-3">
              <span className="text-muted-foreground">{t('prescription.prescribedBy')}</span>
              <span className="font-semibold text-foreground">{result.doctor_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('prescription.date')}</span>
              <span className="text-foreground font-medium">{result.date}</span>
            </div>
            {result.notes && (
              <p className="text-xs text-muted-foreground mt-3 italic bg-secondary/30 p-2 rounded-lg">{result.notes}</p>
            )}
          </div>

          {/* Medicines */}
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Pill className="w-4 h-4 text-primary" />
            {t('prescription.medicines')} ({result.medicines.length})
          </h3>
          <div className="space-y-3 mb-6">
            {result.medicines.map((med, i) => (
              <MedicineCard key={i} med={med} />
            ))}
          </div>

          {/* Total savings */}
          {(result.total_market_price > 0 || result.total_jan_aushadhi_price > 0) && (
            <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-lg mb-6">
              <h3 className="font-bold text-lg mb-4">{t('prescription.totalSavings')}</h3>
              <div className="flex justify-between text-sm mb-2 opacity-90">
                <span>{t('prescription.marketTotal')}</span>
                <span>&#8377;{result.total_market_price.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span>{t('prescription.janAushadhiTotal')}</span>
                <span className="font-bold text-lg">&#8377;{result.total_jan_aushadhi_price.toFixed(0)}</span>
              </div>
              {result.total_market_price > result.total_jan_aushadhi_price && (
                <div className="flex justify-between pt-4 border-t border-primary-foreground/20">
                  <span className="font-bold text-lg">{t('prescription.savings')}</span>
                  <span className="font-bold text-2xl">
                    &#8377;{(result.total_market_price - result.total_jan_aushadhi_price).toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Save + Reset */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={`flex-1 px-5 py-3 rounded-xl font-medium text-center border flex items-center justify-center gap-2 text-sm ${saved ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'}`}>
              {saved ? <CheckCircle className="w-4 h-4" /> : null}
              {saved ? t('prescription.savedToRecords') : t('prescription.couldNotSave')}
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-colors"
            >
              <ScanLine className="w-4 h-4" />
              {t('prescription.scanAnother')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
