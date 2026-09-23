'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle, Building, User, Phone, Mail, Gauge, Calendar, FileText } from 'lucide-react';

export default function NewTenantPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    roomNumber: '',
    name: '',
    phone: '',
    email: '',
    meterNumber: '',
    initialReading: '0',
    moveInDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.roomNumber.trim()) {
      setError('Please provide both the Tenant Name and Room Number.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create tenant record');
      }

      router.push(`/tenants/${data.id || data.tenant?.Id || ''}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Add New Tenant</h1>
          <p className="text-[11px] text-slate-500">Register new room & electricity meter</p>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Room & Name Card */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Room & Tenant Info
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-600" />
                  Room No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  required
                  placeholder="e.g. Room 101"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 placeholder:font-normal focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  Tenant Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:font-normal focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. +91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. tenant@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Meter Setup Card */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Electricity Meter Baseline
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-600" />
                  Initial Reading <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="initialReading"
                  required
                  placeholder="0"
                  value={formData.initialReading}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:border-amber-500 outline-none"
                />
                <span className="text-[10px] text-slate-400">Base units at move-in</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  Meter Number
                </label>
                <input
                  type="text"
                  name="meterNumber"
                  placeholder="e.g. MTR-101"
                  value={formData.meterNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-amber-500 outline-none"
                />
                <span className="text-[10px] text-slate-400">Physical box ID</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Move-in Date
              </label>
              <input
                type="date"
                name="moveInDate"
                value={formData.moveInDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Notes / Terms
              </label>
              <textarea
                name="notes"
                rows={2}
                placeholder="e.g. Rent agreement signed, deposit ₹10,000..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-amber-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Tenant...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Save Tenant & Room</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
