'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Sliders, ShieldCheck, Cloud, Zap, CheckCircle2, AlertCircle, RefreshCw, Key, HelpCircle, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const [defaultRate, setDefaultRate] = useState('11.00');
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    checkHealth();
    // Fetch current rate from server
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.defaultRate) setDefaultRate(d.defaultRate);
      })
      .catch(() => {
        const saved = localStorage.getItem('bijli_default_rate') || process.env.NEXT_PUBLIC_DEFAULT_RATE || '11.00';
        setDefaultRate(saved);
      });
  }, []);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultRate }),
      });
      localStorage.setItem('bijli_default_rate', defaultRate);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (_) {
      localStorage.setItem('bijli_default_rate', defaultRate);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const isSfLive = health?.salesforce?.configured && health?.salesforce?.connected;
  const isCloudinaryLive = health?.cloudinary?.configured;

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
          <h1 className="text-base font-bold text-slate-900 leading-tight">Settings & Config</h1>
          <p className="text-[11px] text-slate-500">Electricity rate & cloud integrations</p>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-4">
        
        {/* Default Rate Settings Card - links to dedicated rate page */}
        <Link
          href="/rate"
          className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Default Unit Rate</h2>
              <p className="text-xs text-slate-500">Current rate: <strong className="text-amber-700 font-bold font-mono">₹{defaultRate}/unit</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
            <span>Edit</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>


        {/* Integration Status Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Integrations Status</h2>
                <p className="text-xs text-slate-500">Salesforce DB & Cloudinary Storage</p>
              </div>
            </div>

            <button
              onClick={checkHealth}
              disabled={checking}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all"
              title="Test connection"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Salesforce Status Item */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Salesforce (Database)</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSfLive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isSfLive ? 'Connected & Live' : 'Demo Mode / Not Configured'}
                </span>
              </div>

              {health?.salesforce?.error && (
                <div className="p-2 rounded-lg bg-rose-50 text-rose-700 text-[11px] border border-rose-200">
                  {health.salesforce.error}
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                Uses OAuth 2.0 Client Credentials flow via your External Client App.
              </p>
            </div>

            {/* Cloudinary Status Item */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                  <span className="text-xs font-bold text-slate-800">Cloudinary (Photos)</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCloudinaryLive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isCloudinaryLive ? 'Active' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Stores meter inspection photos and links them to Salesforce readings.
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Setup Guide */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              How to Connect Real Salesforce & Cloudinary
            </h3>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              Open the file <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-900 font-mono text-[11px]">.env.local</code> in the project directory and fill in your credentials:
            </p>

            <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto">
{`SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret`}
            </pre>

            <p className="text-[11px] text-slate-500">
              Restart the app with <code className="font-mono bg-slate-100 px-1 rounded text-slate-700">npm run dev</code> after editing <code className="font-mono bg-slate-100 px-1 rounded text-slate-700">.env.local</code>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
