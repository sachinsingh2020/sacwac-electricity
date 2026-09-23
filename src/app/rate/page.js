'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Zap, CheckCircle2, IndianRupee, Calculator, Info } from 'lucide-react';

export default function RatePage() {
  const [rate, setRate] = useState('11.00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchRate();
  }, []);

  const fetchRate = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.defaultRate) {
        setRate(data.defaultRate);
        localStorage.setItem('bijli_default_rate', data.defaultRate);
      }
    } catch (_) {
      const local = localStorage.getItem('bijli_default_rate') || '11.00';
      setRate(local);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const numRate = parseFloat(rate);
      if (isNaN(numRate) || numRate < 0) {
        alert('Please enter a valid rate per unit.');
        return;
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultRate: numRate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save rate');

      localStorage.setItem('bijli_default_rate', data.defaultRate);
      setRate(data.defaultRate);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Error saving rate');
    } finally {
      setSaving(false);
    }
  };

  const adjustRate = (delta) => {
    const current = parseFloat(rate) || 0;
    const next = Math.max(0, current + delta);
    setRate(next.toFixed(2));
  };

  const currentRateNum = parseFloat(rate) || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Electricity Rate</h1>
          <p className="text-[11px] text-slate-500">Configure default price per reading unit</p>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-4">
        
        {/* Main Rate Card */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-amber-500/20 text-center">
          <span className="text-xs font-semibold text-amber-100 uppercase tracking-wider block">
            Current Default Price
          </span>
          <div className="text-5xl font-black font-mono tracking-tight my-2">
            ₹{loading ? '...' : rate}
            <span className="text-lg font-bold font-sans text-amber-200 ml-1.5">/ unit</span>
          </div>
          <p className="text-xs text-amber-100 max-w-xs mx-auto">
            This price will be automatically pre-filled whenever you log a new meter reading.
          </p>
        </div>

        {/* Edit Rate Form */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Edit Default Rate</h2>
              <p className="text-xs text-slate-500">Set the new price per electricity unit</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rate per Unit (₹)
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustRate(-1)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-bold flex items-center justify-center active:scale-95 transition-all"
                >
                  -1
                </button>

                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-amber-500 font-mono text-xl font-bold text-slate-900 text-center outline-none transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => adjustRate(1)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-bold flex items-center justify-center active:scale-95 transition-all"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center justify-center gap-2">
              {[8, 9, 10, 11, 12, 13].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRate(preset.toFixed(2))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    parseFloat(rate) === preset
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            {savedSuccess && (
              <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Default rate successfully updated to ₹{rate}!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating Rate...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Default Rate (₹{rate})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Bill Sample Calculator */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sample Bill Estimates @ ₹{rate}/unit
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">50 Units</span>
              <strong className="text-sm font-bold text-slate-900 font-mono">
                ₹{(50 * currentRateNum).toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">100 Units</span>
              <strong className="text-sm font-bold text-slate-900 font-mono">
                ₹{(100 * currentRateNum).toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">150 Units</span>
              <strong className="text-sm font-bold text-slate-900 font-mono">
                ₹{(150 * currentRateNum).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-blue-900 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            When you add a new meter reading, this rate will automatically show up as the default. You can still modify the rate on individual readings if needed.
          </span>
        </div>

      </div>
    </div>
  );
}
