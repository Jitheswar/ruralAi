'use client';

import { useState } from 'react';
import { searchMedicines, getMedicinesByCategory, type Medicine } from '@/lib/supabaseData';
import {
  Search,
  Pill,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'analgesic', label: 'Pain Relief' },
  { id: 'antibiotic', label: 'Antibiotics' },
  { id: 'antidiabetic', label: 'Diabetes' },
  { id: 'antihypertensive', label: 'Blood Pressure' },
  { id: 'cardiac', label: 'Heart' },
  { id: 'respiratory', label: 'Respiratory' },
  { id: 'gastrointestinal', label: 'Stomach' },
  { id: 'dermatological', label: 'Skin' },
  { id: 'vitamin', label: 'Vitamins' },
];

function MedicineCard({ med }: { med: Medicine }) {
  const [expanded, setExpanded] = useState(false);

  const hasPricing = med.market_price != null || med.jan_aushadhi_price != null;

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
            <Pill className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{med.brand_name}</h3>
            <p className="text-sm text-muted-foreground">{med.generic_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {med.is_nlem && (
            <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">NLEM</span>
          )}
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full capitalize">{med.category}</span>
        </div>
      </div>

      {med.salt_composition && (
        <p className="text-xs text-muted-foreground mb-1 ml-11">Salt: {med.salt_composition}</p>
      )}

      <div className="flex gap-3 text-xs text-muted-foreground mb-3 ml-11">
        {med.dosage_form && <span>{med.dosage_form}</span>}
        {med.strength && <span>· {med.strength}</span>}
        {med.manufacturer && <span>· {med.manufacturer}</span>}
      </div>

      {med.hindi_name && (
        <p className="text-sm text-muted-foreground mb-3 ml-11">{med.hindi_name}</p>
      )}

      {/* Pricing */}
      {hasPricing && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-3 space-y-1.5 mb-3 ml-11 border border-emerald-100 dark:border-emerald-500/20">
          {med.market_price != null && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Market Price</span>
              <span className="text-foreground">&#8377;{med.market_price.toFixed(0)}</span>
            </div>
          )}
          {med.jan_aushadhi_price != null && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Jan Aushadhi</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">&#8377;{med.jan_aushadhi_price.toFixed(0)}</span>
            </div>
          )}
          {med.jan_aushadhi_name && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{med.jan_aushadhi_name}</p>
          )}
          {med.savings_percent != null && med.savings_percent > 0 && (
            <div className="flex justify-between text-sm pt-1.5 border-t border-emerald-200 dark:border-emerald-500/30">
              <span className="text-emerald-600 dark:text-emerald-400">You save</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{med.savings_percent.toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium ml-11"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Hide details' : 'Show uses, side effects & more'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 text-sm ml-11 animate-in fade-in slide-in-from-top-1 duration-200">
          {med.uses?.length > 0 && (
            <div>
              <p className="font-medium text-foreground mb-1">Uses</p>
              <div className="flex flex-wrap gap-1.5">
                {med.uses.map((use, i) => (
                  <span key={i} className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-xs">{use}</span>
                ))}
              </div>
            </div>
          )}
          {med.side_effects?.length > 0 && (
            <div>
              <p className="font-medium text-foreground mb-1">Side Effects</p>
              <div className="flex flex-wrap gap-1.5">
                {med.side_effects.map((se, i) => (
                  <span key={i} className="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded text-xs">{se}</span>
                ))}
              </div>
            </div>
          )}
          {med.contraindications?.length > 0 && (
            <div>
              <p className="font-medium text-foreground mb-1">Contraindications</p>
              <div className="flex flex-wrap gap-1.5">
                {med.contraindications.map((ci, i) => (
                  <span key={i} className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-xs">{ci}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MedicineSearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Medicine[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);
    setError('');

    try {
      const data = await searchMedicines(trimmed);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{t('medicine.title')}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {t('medicine.searchDescription')}
      </p>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('medicine.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={`px-6 py-3 rounded-xl font-medium text-sm transition-colors ${loading || !query.trim()
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : 'Search'}
        </button>
      </form>

      {/* Category quick filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              if (cat.id === 'all') {
                setQuery('');
                setSearched(false);
                setResults([]);
              } else {
                setQuery(cat.id);
                setLoading(true);
                setSearched(true);
                setError('');
                getMedicinesByCategory(cat.id).then((data) => {
                  setResults(data);
                  setLoading(false);
                }).catch(() => {
                  setError('Search failed');
                  setLoading(false);
                });
              }
            }}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-muted-foreground hover:bg-secondary transition-colors"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 mb-6">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t('medicine.searching')}</p>
        </div>
      )}

      {/* Results */}
      {!loading && searched && !error && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {results.length} medicine{results.length !== 1 ? 's' : ''} found
          </p>

          {results.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Pill className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">{t('medicine.noMedicines')}</p>
              <p className="text-muted-foreground text-sm">
                Try searching with a different name, salt composition, or Hindi name.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((med) => (
                <MedicineCard key={med.id} med={med} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Initial state — info card */}
      {!searched && !loading && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
          <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            {t('medicine.aboutJanAushadhi')}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) provides quality generic
            medicines at affordable prices. Generic medicines contain the same active ingredients
            as branded medicines but can cost up to 50-90% less.
          </p>
          <p className="text-sm text-muted-foreground">
            Our database includes 150+ commonly used Indian medicines with their Jan Aushadhi
            equivalents, market prices, uses, side effects, and Hindi names.
          </p>
        </div>
      )}
    </div>
  );
}
