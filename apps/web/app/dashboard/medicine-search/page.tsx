'use client';

import { useState } from 'react';
import { searchMedicines, getMedicinesByCategory, type Medicine } from '@/lib/supabaseData';

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
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-semibold text-gray-900">{med.brand_name}</h3>
          <p className="text-sm text-gray-500">{med.generic_name}</p>
        </div>
        <div className="flex items-center gap-2">
          {med.is_nlem && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">NLEM</span>
          )}
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{med.category}</span>
        </div>
      </div>

      {med.salt_composition && (
        <p className="text-xs text-gray-400 mb-1">Salt: {med.salt_composition}</p>
      )}

      <div className="flex gap-3 text-xs text-gray-500 mb-3">
        {med.dosage_form && <span>{med.dosage_form}</span>}
        {med.strength && <span>&middot; {med.strength}</span>}
        {med.manufacturer && <span>&middot; {med.manufacturer}</span>}
      </div>

      {med.hindi_name && (
        <p className="text-sm text-gray-600 mb-3">{med.hindi_name}</p>
      )}

      {/* Pricing */}
      {hasPricing && (
        <div className="bg-green-50 rounded-lg p-3 space-y-1.5 mb-3">
          {med.market_price != null && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Market Price</span>
              <span className="text-gray-700">&#8377;{med.market_price.toFixed(0)}</span>
            </div>
          )}
          {med.jan_aushadhi_price != null && (
            <div className="flex justify-between text-sm">
              <span className="text-green-700 font-medium">Jan Aushadhi</span>
              <span className="text-green-700 font-bold">&#8377;{med.jan_aushadhi_price.toFixed(0)}</span>
            </div>
          )}
          {med.jan_aushadhi_name && (
            <p className="text-xs text-green-600">{med.jan_aushadhi_name}</p>
          )}
          {med.savings_percent != null && med.savings_percent > 0 && (
            <div className="flex justify-between text-sm pt-1.5 border-t border-green-200">
              <span className="text-green-600">You save</span>
              <span className="text-green-600 font-bold">{med.savings_percent.toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-600 hover:underline"
      >
        {expanded ? 'Hide details' : 'Show uses, side effects & more'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 text-sm">
          {med.uses?.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Uses</p>
              <div className="flex flex-wrap gap-1.5">
                {med.uses.map((use, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{use}</span>
                ))}
              </div>
            </div>
          )}
          {med.side_effects?.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Side Effects</p>
              <div className="flex flex-wrap gap-1.5">
                {med.side_effects.map((se, i) => (
                  <span key={i} className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs">{se}</span>
                ))}
              </div>
            </div>
          )}
          {med.contraindications?.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Contraindications</p>
              <div className="flex flex-wrap gap-1.5">
                {med.contraindications.map((ci, i) => (
                  <span key={i} className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs">{ci}</span>
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Medicine Search</h1>
      <p className="text-gray-500 text-sm mb-6">
        Search our database of 150+ Indian medicines to find affordable Jan Aushadhi generic alternatives.
      </p>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, salt, or Hindi name (e.g. Paracetamol, पैरासिटामोल)"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={`px-6 py-3 rounded-xl font-medium text-sm transition-colors ${loading || !query.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {loading ? 'Searching...' : 'Search'}
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
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-3xl mb-3 animate-pulse">🔍</div>
          <p className="text-gray-500">Searching medicines...</p>
        </div>
      )}

      {/* Results */}
      {!loading && searched && !error && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} medicine{results.length !== 1 ? 's' : ''} found
          </p>

          {results.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-3xl mb-3">💊</div>
              <p className="text-gray-700 font-medium mb-1">No medicines found</p>
              <p className="text-gray-400 text-sm">
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-blue-800 font-semibold mb-3">About Jan Aushadhi</h3>
          <p className="text-sm text-blue-700 mb-3">
            Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) provides quality generic
            medicines at affordable prices. Generic medicines contain the same active ingredients
            as branded medicines but can cost up to 50-90% less.
          </p>
          <p className="text-sm text-blue-700">
            Our database includes 150+ commonly used Indian medicines with their Jan Aushadhi
            equivalents, market prices, uses, side effects, and Hindi names.
          </p>
        </div>
      )}
    </div>
  );
}
