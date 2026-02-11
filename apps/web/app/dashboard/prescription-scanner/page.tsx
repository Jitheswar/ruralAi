'use client';

import { useState, useRef } from 'react';
import { scanPrescription, type PrescriptionResult, type PrescriptionMedicine } from '@/lib/aiService';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { getSession } from '@/lib/auth';

type ScanState = 'idle' | 'scanning' | 'done' | 'error';

function MedicineCard({ med }: { med: PrescriptionMedicine }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{med.name}</h4>
          {med.generic_name && med.generic_name !== med.name && (
            <p className="text-xs text-gray-400">Generic: {med.generic_name}</p>
          )}
        </div>
        {med.found_in_db && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">In DB</span>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-1 mb-3">
        {med.dosage} &middot; {med.frequency} &middot; {med.duration}
      </p>

      {(med.market_price > 0 || med.jan_aushadhi_price > 0) && (
        <div className="bg-green-50 rounded-lg p-3 space-y-1.5">
          {med.market_price > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Market Price</span>
              <span className="text-gray-700">&#8377;{med.market_price.toFixed(0)}</span>
            </div>
          )}
          {med.jan_aushadhi_price > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-700 font-medium">Jan Aushadhi</span>
              <span className="text-green-700 font-bold">&#8377;{med.jan_aushadhi_price.toFixed(0)}</span>
            </div>
          )}
          {med.savings_percent > 0 && (
            <div className="flex justify-between text-sm pt-1.5 border-t border-green-200">
              <span className="text-green-600">You save</span>
              <span className="text-green-600 font-bold">{med.savings_percent}%</span>
            </div>
          )}
        </div>
      )}

      {med.jan_aushadhi_name && med.jan_aushadhi_name !== med.name && (
        <p className="text-xs text-gray-400 mt-2">
          Jan Aushadhi: {med.jan_aushadhi_name}
        </p>
      )}

      {/* Expandable details */}
      {(med.uses?.length > 0 || med.side_effects?.length > 0) && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:underline"
          >
            {expanded ? 'Hide details' : 'Show uses & side effects'}
          </button>
          {expanded && (
            <div className="mt-2 space-y-2">
              {med.uses?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Uses:</p>
                  <p className="text-xs text-gray-500">{med.uses.join(', ')}</p>
                </div>
              )}
              {med.side_effects?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Side effects:</p>
                  <p className="text-xs text-gray-500">{med.side_effects.join(', ')}</p>
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Prescription Scanner</h1>
      <p className="text-gray-500 text-sm mb-6">
        Scan a prescription to find affordable Jan Aushadhi alternatives using AI.
      </p>

      {/* Idle: Upload area */}
      {state === 'idle' && (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="text-4xl mb-3">📷</div>
            <p className="text-gray-700 font-medium mb-1">Upload Prescription</p>
            <p className="text-gray-400 text-sm">
              Drag &amp; drop an image or click to browse
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
            <h3 className="text-blue-800 font-semibold mb-3">How it works</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>1. Upload a photo of your prescription</p>
              <p>2. AI extracts medicine names and dosages using Gemini Vision</p>
              <p>3. We look up Jan Aushadhi alternatives from our database</p>
              <p>4. See real price comparisons and savings</p>
            </div>
          </div>
        </div>
      )}

      {/* Scanning */}
      {state === 'scanning' && (
        <div className="text-center py-16">
          {preview && (
            <img
              src={preview}
              alt="Prescription"
              className="w-48 h-48 object-cover rounded-xl mx-auto mb-6 border border-gray-200"
            />
          )}
          <div className="text-4xl mb-4 animate-pulse">🔍</div>
          <p className="text-gray-700 font-medium">Scanning prescription with AI...</p>
          <p className="text-gray-400 text-sm mt-1">Extracting medicine information using Gemini Vision</p>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="text-center py-12">
          {preview && (
            <img
              src={preview}
              alt="Prescription"
              className="w-32 h-32 object-cover rounded-xl mx-auto mb-6 border border-gray-200 opacity-50"
            />
          )}
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
            <p className="text-red-700 text-sm">{errorMsg}</p>
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {state === 'done' && result && (
        <div>
          {/* Doctor info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Prescribed by</span>
              <span className="font-medium text-gray-900">{result.doctor_name}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Date</span>
              <span className="text-gray-700">{result.date}</span>
            </div>
            {result.notes && (
              <p className="text-xs text-gray-400 mt-2">{result.notes}</p>
            )}
          </div>

          {/* Medicines */}
          <h3 className="font-semibold text-gray-900 mb-3">
            Medicines ({result.medicines.length})
          </h3>
          {result.medicines.map((med, i) => (
            <MedicineCard key={i} med={med} />
          ))}

          {/* Total savings */}
          {(result.total_market_price > 0 || result.total_jan_aushadhi_price > 0) && (
            <div className="bg-green-600 rounded-xl p-5 text-white mb-4">
              <h3 className="font-bold text-lg mb-3">Total Savings</h3>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-100">Market total</span>
                <span>&#8377;{result.total_market_price.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-100">Jan Aushadhi total</span>
                <span className="font-bold">&#8377;{result.total_jan_aushadhi_price.toFixed(0)}</span>
              </div>
              {result.total_market_price > result.total_jan_aushadhi_price && (
                <div className="flex justify-between pt-2 border-t border-green-400">
                  <span className="font-bold">You save</span>
                  <span className="font-bold text-lg">
                    &#8377;{(result.total_market_price - result.total_jan_aushadhi_price).toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Save + Reset */}
          <div className="flex gap-3">
            <div className={`flex-1 px-6 py-3 rounded-xl font-medium text-center ${saved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {saved ? 'Saved to your health records' : 'Could not save to records — check connection'}
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
