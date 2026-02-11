'use client';

import { useState } from 'react';
import { getSession } from '@/lib/auth';
import { getSymptomList, getCategories } from '@/lib/engine/triageEngine';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { API_CONFIG } from '@rural-ai/shared';

type Step = 'symptoms' | 'duration' | 'modifiers' | 'profile' | 'analyzing' | 'results';

const CATEGORY_LABELS: Record<string, string> = {
  cardiac: 'Heart',
  general: 'General',
  neuro: 'Neurological',
  respiratory: 'Breathing',
  gastro: 'Stomach',
};

const MEDICAL_CONDITIONS = [
  'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid',
  'Kidney Disease', 'Liver Disease', 'Arthritis', 'Epilepsy', 'Anemia',
];

interface AIAnalysis {
  possible_conditions?: { name: string; likelihood: string; description: string }[];
  severity?: string;
  summary?: string;
  recommended_medicines?: { generic_name: string; dosage: string; frequency: string; duration: string; reason: string }[];
  home_care?: string[];
  warning_signs?: string[];
  see_doctor_urgency?: string;
  follow_up_questions?: string[];
  error?: string;
}

interface AnalysisResult {
  emergency_alerts: { rule_id: string; name: string; severity: string; message: string; instructions: string[] }[];
  ai_analysis: AIAnalysis;
  has_emergency: boolean;
}

const URGENCY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  immediately: { bg: 'bg-red-100', text: 'text-red-800', label: 'See Doctor Immediately' },
  within_24h: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'See Doctor Within 24 Hours' },
  within_week: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'See Doctor This Week' },
  monitor: { bg: 'bg-green-100', text: 'text-green-800', label: 'Monitor at Home' },
};

export default function SymptomCheckerPage() {
  const user = getSession();
  const symptoms = getSymptomList();
  const categories = getCategories();

  const [step, setStep] = useState<Step>('symptoms');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState(1);
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [currentMeds, setCurrentMeds] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleSymptom(id: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function toggleCondition(condition: string) {
    setMedicalHistory((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  }

  async function handleAnalyze() {
    setStep('analyzing');

    const body = {
      symptoms: selectedSymptoms,
      modifiers,
      duration_days: duration,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      medical_history: medicalHistory,
      current_medications: currentMeds ? currentMeds.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };

    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error('You must be logged in to analyze symptoms.');

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.BASE_URL;
      const res = await fetch(`${apiBase}/api/symptoms/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
      setStep('results');
      setSaved(!!data.saved);
    } catch (err) {
      console.error('Analysis failed:', err);
      // Wait, if it fails due to auth, we should maybe show that.
      const msg = err instanceof Error ? err.message : 'Analysis failed';

      setResult({
        emergency_alerts: [],
        ai_analysis: { error: `Could not connect to analysis service: ${msg}` },
        has_emergency: false,
      });
      setStep('results');
    }
  }

  function handleReset() {
    setSelectedSymptoms([]);
    setDuration(1);
    setModifiers([]);
    setAge('');
    setGender('');
    setMedicalHistory([]);
    setCurrentMeds('');
    setResult(null);
    setSaved(false);
    setStep('symptoms');
  }

  const stepIndex = ['symptoms', 'duration', 'modifiers', 'profile', 'analyzing', 'results'].indexOf(step);
  const durationOptions = [1, 2, 3, 5, 7];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Symptom Checker</h1>
      <p className="text-gray-500 text-sm mb-6">
        Hi {user?.name || 'there'}, answer a few questions and our AI will provide a detailed health assessment.
      </p>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {['Symptoms', 'Duration', 'Onset', 'Profile', 'Analysis'].map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full mb-1 ${i <= Math.min(stepIndex, 4) ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <p className={`text-[10px] text-center ${i <= stepIndex ? 'text-blue-600' : 'text-gray-400'}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Step 1: Symptoms */}
      {step === 'symptoms' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">What symptoms are you experiencing?</h2>
          {categories.map((cat) => (
            <div key={cat} className="mb-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {CATEGORY_LABELS[cat] || cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {symptoms.filter((s) => s.category === cat).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedSymptoms.includes(s.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {selectedSymptoms.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">{selectedSymptoms.length}</span> symptom{selectedSymptoms.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Duration */}
      {step === 'duration' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">How long have you had these symptoms?</h2>
          <div className="flex flex-wrap gap-3">
            {durationOptions.map((d) => (
              <button key={d} onClick={() => setDuration(d)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-colors ${duration === d ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                {d} {d === 1 ? 'day' : 'days'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Modifiers */}
      {step === 'modifiers' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Did the symptoms start suddenly?</h2>
          <div className="flex gap-3">
            <button onClick={() => setModifiers(['sudden_onset'])}
              className={`flex-1 px-6 py-4 rounded-xl text-sm font-medium transition-colors ${modifiers.includes('sudden_onset') ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
              Yes, suddenly
            </button>
            <button onClick={() => setModifiers([])}
              className={`flex-1 px-6 py-4 rounded-xl text-sm font-medium transition-colors ${!modifiers.includes('sudden_onset') ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
              Gradually
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Medical Profile */}
      {step === 'profile' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tell us about yourself</h2>
          <p className="text-sm text-gray-500 mb-6">This helps our AI provide more accurate analysis. All fields are optional.</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 35"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Existing conditions (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {MEDICAL_CONDITIONS.map((cond) => (
                <button key={cond} onClick={() => toggleCondition(cond)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${medicalHistory.includes(cond)
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}>
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current medications (comma-separated)</label>
            <input type="text" value={currentMeds} onChange={(e) => setCurrentMeds(e.target.value)}
              placeholder="e.g. Metformin, Amlodipine"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      )}

      {/* Step 5: Analyzing */}
      {step === 'analyzing' && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 animate-pulse">🩺</div>
          <p className="text-gray-700 font-medium text-lg">Analyzing your symptoms...</p>
          <p className="text-gray-400 text-sm mt-2">Our AI is evaluating your condition using medical knowledge</p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Step 6: Results */}
      {step === 'results' && result && (
        <div className="space-y-5">
          {/* Error state */}
          {result.ai_analysis.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="text-red-700">{result.ai_analysis.error}</p>
            </div>
          )}

          {/* Emergency Alerts */}
          {result.emergency_alerts.map((alert) => (
            <div key={alert.rule_id} className="bg-red-50 border-2 border-red-400 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <h3 className="font-bold text-red-800 text-lg">{alert.name}</h3>
                  <p className="text-red-700 mt-1">{alert.message}</p>
                </div>
              </div>
              <div className="bg-red-100 rounded-lg p-3 mb-3">
                <p className="text-red-900 font-bold text-center text-lg">Call 108 for Ambulance</p>
              </div>
              <div className="space-y-1.5 ml-9">
                {alert.instructions.map((inst, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-xs font-bold text-red-800 mt-0.5">{i + 1}.</span>
                    <p className="text-sm text-red-800">{inst}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* AI Analysis (when no error) */}
          {!result.ai_analysis.error && (
            <>
              {/* Summary + Urgency */}
              {result.ai_analysis.summary && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-gray-800 font-medium">{result.ai_analysis.summary}</p>
                  {result.ai_analysis.see_doctor_urgency && (
                    <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-medium ${(URGENCY_STYLES[result.ai_analysis.see_doctor_urgency] || URGENCY_STYLES.monitor).bg
                      } ${(URGENCY_STYLES[result.ai_analysis.see_doctor_urgency] || URGENCY_STYLES.monitor).text}`}>
                      {(URGENCY_STYLES[result.ai_analysis.see_doctor_urgency] || URGENCY_STYLES.monitor).label}
                    </div>
                  )}
                </div>
              )}

              {/* Possible Conditions */}
              {result.ai_analysis.possible_conditions && result.ai_analysis.possible_conditions.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Possible Conditions</h3>
                  <div className="space-y-3">
                    {result.ai_analysis.possible_conditions.map((cond, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cond.likelihood === 'high' ? 'bg-red-100 text-red-700' :
                          cond.likelihood === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{cond.likelihood}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cond.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{cond.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Medicines */}
              {result.ai_analysis.recommended_medicines && result.ai_analysis.recommended_medicines.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Recommended Medicines</h3>
                  <div className="space-y-3">
                    {result.ai_analysis.recommended_medicines.map((med, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-3">
                        <p className="font-medium text-blue-900">{med.generic_name}</p>
                        <p className="text-xs text-blue-700 mt-1">
                          {med.dosage} &middot; {med.frequency} &middot; {med.duration}
                        </p>
                        <p className="text-xs text-blue-600 mt-1 italic">{med.reason}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 italic">
                    * This is AI-generated guidance. Always consult a doctor before taking medicine.
                  </p>
                </div>
              )}

              {/* Home Care */}
              {result.ai_analysis.home_care && result.ai_analysis.home_care.length > 0 && (
                <div className="bg-green-50 rounded-xl border border-green-200 p-5">
                  <h3 className="font-semibold text-green-800 mb-2">Home Care Advice</h3>
                  <ul className="space-y-1.5">
                    {result.ai_analysis.home_care.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-green-700">
                        <span className="text-green-500 mt-0.5">&#10003;</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning Signs */}
              {result.ai_analysis.warning_signs && result.ai_analysis.warning_signs.length > 0 && (
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-5">
                  <h3 className="font-semibold text-orange-800 mb-2">Warning Signs to Watch For</h3>
                  <ul className="space-y-1.5">
                    {result.ai_analysis.warning_signs.map((sign, i) => (
                      <li key={i} className="flex gap-2 text-sm text-orange-700">
                        <span className="text-orange-500 mt-0.5">&#9888;</span>
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Save + Reset buttons */}
          <div className="flex gap-3 pt-2">
            <div className={`flex-1 px-6 py-3 rounded-xl font-medium text-center ${saved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {saved ? 'Saved to your health records' : 'Could not save to records — check connection'}
            </div>
            <button onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors">
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Navigation buttons (for steps before results) */}
      {!['analyzing', 'results'].includes(step) && (
        <div className="mt-8 flex gap-3">
          {step !== 'symptoms' && (
            <button onClick={() => {
              const steps: Step[] = ['symptoms', 'duration', 'modifiers', 'profile'];
              const idx = steps.indexOf(step);
              if (idx > 0) setStep(steps[idx - 1]);
            }} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step === 'symptoms') setStep('duration');
              else if (step === 'duration') setStep('modifiers');
              else if (step === 'modifiers') setStep('profile');
              else if (step === 'profile') handleAnalyze();
            }}
            disabled={step === 'symptoms' && selectedSymptoms.length === 0}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${step === 'symptoms' && selectedSymptoms.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
            {step === 'profile' ? 'Analyze Symptoms' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
