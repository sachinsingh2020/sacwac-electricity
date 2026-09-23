'use client';
import { useState, useEffect } from 'react';
import { X, Upload, Camera, Trash2, CheckCircle2, AlertTriangle, Zap, DollarSign, Calendar } from 'lucide-react';

export default function ReadingModal({ isOpen, onClose, tenant, onSuccess }) {
  const [currentReading, setCurrentReading] = useState('');
  const [ratePerUnit, setRatePerUnit] = useState('11.00');
  const [readingDateTime, setReadingDateTime] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Set default datetime to now and default rate
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // Format as YYYY-MM-DDTHH:mm for datetime-local input
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setReadingDateTime(localIso);

      const savedRate = localStorage.getItem('bijli_default_rate') || process.env.NEXT_PUBLIC_DEFAULT_RATE || '11.00';
      setRatePerUnit(savedRate);

      // Also sync from server settings
      fetch('/api/settings')
        .then((r) => r.json())
        .then((d) => {
          if (d.defaultRate) setRatePerUnit(d.defaultRate);
        })
        .catch(() => {});

      setCurrentReading('');
      setPaymentStatus('Pending');
      setNotes('');
      setSelectedFile(null);
      setPreviewUrl('');
      setErrorMessage('');
    }
  }, [isOpen, tenant]);

  if (!isOpen || !tenant) return null;

  const previousReading = Number(tenant.Latest_Reading__c) || Number(tenant.Initial_Reading__c) || 0;
  const currentVal = parseFloat(currentReading);
  const rateVal = parseFloat(ratePerUnit) || 0;

  const isValidReading = !isNaN(currentVal) && currentVal >= previousReading;
  const unitsConsumed = isValidReading ? Math.round((currentVal - previousReading) * 100) / 100 : 0;
  const totalAmount = isValidReading ? Math.round((unitsConsumed * rateVal) * 100) / 100 : 0;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isNaN(currentVal)) {
      setErrorMessage('Please enter the current meter reading.');
      return;
    }

    if (currentVal < previousReading) {
      setErrorMessage(`Current reading (${currentVal}) cannot be less than previous reading (${previousReading}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      let meterImageUrl = '';
      let imagePublicId = '';

      // 1. Upload photo if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Image upload failed');
        }

        const uploadData = await uploadRes.json();
        meterImageUrl = uploadData.url || '';
        imagePublicId = uploadData.publicId || '';
      }

      // 2. Submit reading record
      const res = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.Id,
          previousReading,
          currentReading: currentVal,
          ratePerUnit: rateVal,
          readingDateTime: new Date(readingDateTime).toISOString(),
          paymentStatus,
          meterImageUrl,
          imagePublicId,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save reading');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong while saving the reading.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-xs">
                {tenant.Room_Number__c}
              </span>
              <h2 className="text-base font-bold text-slate-900">{tenant.Name}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Add New Electricity Reading</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Readings Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Previous Reading
              </label>
              <div className="w-full px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-base font-bold text-slate-700">
                {previousReading} <span className="text-xs font-normal text-slate-500">units</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Current Reading <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min={previousReading}
                required
                autoFocus
                placeholder="e.g. 1420"
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border-2 border-amber-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none font-mono text-base font-bold text-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Dynamic Rate & Live Calculation */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-700" />
                Rate per Unit (₹):
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-amber-900">₹</span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(e.target.value)}
                  className="w-20 px-2 py-1 rounded-lg border border-amber-300 bg-white font-bold text-sm text-right text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-amber-800">Units Consumed:</span>{' '}
                <strong className="text-slate-900 text-sm font-mono">{unitsConsumed}</strong>
              </div>
              <div className="text-right">
                <span className="text-amber-800">Total Bill Due:</span>{' '}
                <strong className="text-emerald-700 text-base font-extrabold font-mono">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Reading Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={readingDateTime}
              onChange={(e) => setReadingDateTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:border-amber-500 outline-none bg-white"
            />
          </div>

          {/* Meter Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meter Photo <span className="text-slate-400 font-normal">(Optional)</span>
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center group">
                <img
                  src={previewUrl}
                  alt="Meter Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-md"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-amber-50/20 transition-all text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Tap to snap or upload meter photo
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Opens camera directly on mobile phones
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-[11px] text-slate-400 mt-1 italic">
              If skipped: "Photo not uploaded by owner" will be displayed.
            </p>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('Pending')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  paymentStatus === 'Pending'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Pending (Unpaid)
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('Paid')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  paymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Mark Paid (Received)
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via UPI, due by 5th..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 pb-2">
            <button
              type="submit"
              disabled={isSubmitting || !isValidReading}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Reading...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Save Reading (₹{totalAmount})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
