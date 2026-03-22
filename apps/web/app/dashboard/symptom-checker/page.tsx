'use client';

import { useState, useCallback, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { getSymptomList, getCategories } from '@/lib/engine/triageEngine';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { API_CONFIG, toSpeechLocale, toBackendLanguage } from '@rural-ai/shared';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useWebSpeechRecognition } from '@/lib/voice/useWebSpeechRecognition';
import { transcribeText } from '@/lib/aiService';
import {
  Stethoscope,
  AlertTriangle,
  Home,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle,
  Pill,
  Mic,
  MicOff,
} from 'lucide-react';

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
  immediately: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-800 dark:text-red-300', label: 'See Doctor Immediately' },
  within_24h: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-800 dark:text-orange-300', label: 'See Doctor Within 24 Hours' },
  within_week: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-800 dark:text-yellow-300', label: 'See Doctor This Week' },
  monitor: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-800 dark:text-emerald-300', label: 'Monitor at Home' },
};

export default function SymptomCheckerPage() {
  const [user, setUser] = useState<ReturnType<typeof getSession>>(null);
  const symptoms = getSymptomList();
  const categories = getCategories();
  const { language, t } = useLanguage();

  // Fix hydration mismatch: read localStorage in useEffect, not during render
  useEffect(() => {
    setUser(getSession());
  }, []);

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
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const handleVoiceTranscript = useCallback(async (text: string) => {
    setVoiceProcessing(true);
    setVoiceError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const result = await transcribeText(text, toBackendLanguage(language), token);
      if (result.suggested_symptoms?.length) {
        setSelectedSymptoms((prev) => {
          const merged = new Set([...prev, ...result.suggested_symptoms]);
          return Array.from(merged);
        });
      }
    } catch (err) {
      console.error('Voice normalization failed:', err);
      setVoiceError(err instanceof Error ? err.message : 'Voice processing failed');
    } finally {
      setVoiceProcessing(false);
    }
  }, [language]);

  const speech = useWebSpeechRecognition({
    lang: toSpeechLocale(language),
    onTranscript: handleVoiceTranscript,
  });

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
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{t('symptom.aiSymptomChecker')}</h1>
        <p className="text-sm text-muted-foreground">
          Hi {user?.name || 'there'}, answer a few questions and our AI will provide a detailed health assessment.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {[t('symptom.checkSymptoms'), t('symptom.duration'), t('symptom.onset'), t('nav.profile'), t('symptom.results')].map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full mb-2 transition-colors duration-300 ${i <= Math.min(stepIndex, 4) ? 'bg-primary' : 'bg-secondary'}`} />
            <p className={`text-[10px] uppercase tracking-wider font-semibold text-center transition-colors duration-300 ${i <= stepIndex ? 'text-primary' : 'text-muted-foreground'}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Step 1: Symptoms */}
      {step === 'symptoms' && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('symptom.whatSymptoms')}</h2>

          {/* Voice input */}
          <div className="mb-6 p-4 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              {speech.isSupported ? (
                <button
                  onClick={speech.status === 'listening' ? speech.stop : speech.start}
                  disabled={voiceProcessing}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${speech.status === 'listening'
                    ? 'bg-red-500 text-white animate-pulse'
                    : voiceProcessing
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                >
                  {speech.status === 'listening' ? (
                    <><MicOff className="w-4 h-4" /> Stop</>
                  ) : voiceProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Mic className="w-4 h-4" /> {t('symptom.voiceInput')}</>
                  )}
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Voice input is not supported in this browser.
                </p>
              )}
              {speech.transcript && (
                <p className="text-sm text-foreground italic truncate flex-1">
                  &ldquo;{speech.transcript}&rdquo;
                </p>
              )}
            </div>
            {speech.error && (
              <p className="mt-2 text-sm text-destructive">{speech.error}</p>
            )}
            {voiceError && (
              <p className="mt-2 text-sm text-destructive">{voiceError}</p>
            )}
          </div>

          {categories.map((cat) => (
            <div key={cat} className="mb-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                {CATEGORY_LABELS[cat] || cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {symptoms.filter((s) => s.category === cat).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSymptoms.includes(s.id)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card text-muted-foreground border border-input hover:bg-secondary hover:text-foreground'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {selectedSymptoms.length > 0 && (
            <div className="mt-4 p-3 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-sm text-primary font-medium">
                {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Duration */}
      {step === 'duration' && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <h2 className="text-lg font-semibold text-foreground mb-6">{t('symptom.howLong')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {durationOptions.map((d) => (
              <button key={d} onClick={() => setDuration(d)}
                className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${duration === d
                  ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                  : 'bg-card text-foreground border border-input hover:bg-secondary hover:border-primary/50'
                  }`}>
                {d} {d === 1 ? 'day' : 'days'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Modifiers */}
      {step === 'modifiers' && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <h2 className="text-lg font-semibold text-foreground mb-6">{t('symptom.suddenOnsetQ')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setModifiers(['sudden_onset'])}
              className={`px-6 py-6 rounded-xl text-lg font-medium transition-all ${modifiers.includes('sudden_onset')
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-foreground border border-input hover:bg-secondary hover:border-primary/50'
                }`}>
              {t('symptom.sudden')}
            </button>
            <button onClick={() => setModifiers([])}
              className={`px-6 py-6 rounded-xl text-lg font-medium transition-all ${!modifiers.includes('sudden_onset')
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-foreground border border-input hover:bg-secondary hover:border-primary/50'
                }`}>
              {t('symptom.gradual')}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Medical Profile */}
      {step === 'profile' && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <h2 className="text-lg font-semibold text-foreground mb-1">{t('symptom.tellAboutYourself')}</h2>
          <p className="text-sm text-muted-foreground mb-6">This helps our AI provide more accurate analysis. All fields are optional.</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 35"
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">Existing conditions (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {MEDICAL_CONDITIONS.map((cond) => (
                <button key={cond} onClick={() => toggleCondition(cond)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${medicalHistory.includes(cond)
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-card border border-input text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}>
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Current medications (comma-separated)</label>
            <input type="text" value={currentMeds} onChange={(e) => setCurrentMeds(e.target.value)}
              placeholder="e.g. Metformin, Amlodipine"
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      )}

      {/* Step 5: Analyzing */}
      {step === 'analyzing' && (
        <div className="text-center py-24 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-foreground font-semibold text-xl mb-2">{t('symptom.analyzing')}</p>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">Our AI is evaluating your condition using medical knowledge.</p>
          <div className="mt-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        </div>
      )}

      {/* Step 6: Results */}
      {step === 'results' && result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Error state */}
          {result.ai_analysis.error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5">
              <p className="text-destructive font-medium text-sm">{result.ai_analysis.error}</p>
            </div>
          )}

          {/* Emergency Alerts */}
          {result.emergency_alerts.map((alert) => (
            <div key={alert.rule_id} className="bg-red-50 dark:bg-red-500/10 border-2 border-red-500 rounded-xl p-5 shadow-md">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 dark:text-red-300 text-lg">{alert.name}</h3>
                  <p className="text-red-800 dark:text-red-400 mt-1 text-sm">{alert.message}</p>
                </div>
              </div>
              <div className="bg-red-100 dark:bg-red-500/20 rounded-lg p-3 mb-4 border border-red-200 dark:border-red-500/30">
                <p className="text-red-900 dark:text-red-300 font-bold text-center text-base">Call 108 for Ambulance</p>
              </div>
              <div className="space-y-2 ml-9">
                {alert.instructions.map((inst, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-xs font-bold text-red-800 dark:text-red-400 mt-0.5">{i + 1}.</span>
                    <p className="text-sm text-red-900 dark:text-red-300 font-medium">{inst}</p>
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
                <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                  <p className="text-foreground font-medium leading-relaxed">{result.ai_analysis.summary}</p>
                  {result.ai_analysis.see_doctor_urgency && (
                    <div className={`mt-4 inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${(URGENCY_STYLES[result.ai_analysis.see_doctor_urgency] || URGENCY_STYLES.monitor).bg
                      } ${(URGENCY_STYLES[result.ai_analysis.see_doctor_urgency] || URGENCY_STYLES.monitor).text}`}>
                      {(URGENCY_STYLES[result.ai_analysis.see_doctor_urgency] || URGENCY_STYLES.monitor).label}
                    </div>
                  )}
                </div>
              )}

              {/* Possible Conditions */}
              {result.ai_analysis.possible_conditions && result.ai_analysis.possible_conditions.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                  <h3 className="font-semibold text-foreground mb-4">{t('symptom.possibleConditions')}</h3>
                  <div className="space-y-3">
                    {result.ai_analysis.possible_conditions.map((cond, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full mt-0.5 ${cond.likelihood === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                          cond.likelihood === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                            'bg-muted text-muted-foreground'
                          }`}>{cond.likelihood}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{cond.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{cond.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Medicines */}
              {result.ai_analysis.recommended_medicines && result.ai_analysis.recommended_medicines.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-primary" />
                    {t('symptom.recommendedMedicines')}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.ai_analysis.recommended_medicines.map((med, i) => (
                      <div key={i} className="bg-secondary/50 rounded-lg p-4 border border-border">
                        <p className="font-bold text-primary text-sm">{med.generic_name}</p>
                        <p className="text-xs text-foreground mt-1 font-medium">
                          {med.dosage} · {med.frequency} · {med.duration}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 italic">{med.reason}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic border-t border-border pt-3">
                    * This is AI-generated guidance. Always consult a doctor before taking medicine.
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Home Care */}
                {result.ai_analysis.home_care && result.ai_analysis.home_care.length > 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 p-5">
                    <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2">
                      <Home className="w-4 h-4" /> {t('symptom.homeCare')}
                    </h3>
                    <ul className="space-y-2">
                      {result.ai_analysis.home_care.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warning Signs */}
                {result.ai_analysis.warning_signs && result.ai_analysis.warning_signs.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 p-5">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {t('symptom.warningSigns')}
                    </h3>
                    <ul className="space-y-2">
                      {result.ai_analysis.warning_signs.map((sign, i) => (
                        <li key={i} className="flex gap-2 text-sm text-amber-700 dark:text-amber-300">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {saved ? (
              <div className="flex-1 px-5 py-3 rounded-xl font-medium text-center bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {t('prescription.savedToRecords')}
              </div>
            ) : (
              <div className="flex-1 px-5 py-3 rounded-xl font-medium text-center bg-muted text-muted-foreground border border-border text-sm">
                {t('prescription.couldNotSave')}
              </div>
            )}

            <button onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm">
              <RotateCcw className="w-4 h-4" />
              {t('symptom.startOver')}
            </button>
          </div>
        </div>
      )}

      {/* Navigation buttons (for steps before results) */}
      {!['analyzing', 'results'].includes(step) && (
        <div className="mt-8 flex gap-3 pt-6 border-t border-border">
          {step !== 'symptoms' && (
            <button onClick={() => {
              const steps: Step[] = ['symptoms', 'duration', 'modifiers', 'profile'];
              const idx = steps.indexOf(step);
              if (idx > 0) setStep(steps[idx - 1]);
            }} className="inline-flex items-center gap-1.5 px-5 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
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
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm ${step === 'symptoms' && selectedSymptoms.length === 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md'
              }`}>
            {step === 'profile' ? t('symptom.analyzeSymptoms') : t('common.next')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
