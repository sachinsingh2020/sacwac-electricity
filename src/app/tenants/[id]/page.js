'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReadingModal from '@/components/ReadingModal';
import ImageModal from '@/components/ImageModal';
import WhatsAppShare from '@/components/WhatsAppShare';
import {
  ArrowLeft,
  Plus,
  Phone,
  Gauge,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ImageOff,
  Share2,
  ArrowUpDown,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

export default function TenantDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [tenant, setTenant] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' (default) or 'oldest'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedReadingForPhoto, setSelectedReadingForPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (mobile-first) or 'table'

  const fetchTenantData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tenants/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load tenant details');
      }
      setTenant(data.tenant);
      setReadings(data.readings || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  // Handle toggling payment status (Pending <-> Paid)
  const handleTogglePaymentStatus = async (reading) => {
    const nextStatus = reading.Payment_Status__c === 'Paid' ? 'Pending' : 'Paid';
    try {
      const res = await fetch(`/api/readings/${reading.Id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to update payment status');
      
      // Update local state optimistically
      setReadings((prev) =>
        prev.map((r) => (r.Id === reading.Id ? { ...r, Payment_Status__c: nextStatus } : r))
      );
    } catch (err) {
      console.error(err);
      alert('Could not update payment status: ' + err.message);
    }
  };

  // Sort readings according to preference (newest first by default)
  const sortedReadings = [...readings].sort((a, b) => {
    const timeA = new Date(a.Reading_DateTime__c || a.CreatedDate).getTime();
    const timeB = new Date(b.Reading_DateTime__c || b.CreatedDate).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const totalDues = readings
    .filter((r) => r.Payment_Status__c === 'Pending')
    .reduce((sum, r) => sum + (Number(r.Total_Amount__c) || 0), 0);

  const totalUnits = readings.reduce(
    (sum, r) => sum + (Number(r.Units_Consumed__c) || 0),
    0
  );

  const latestReadingRecord = [...readings].sort((a, b) => {
    return new Date(b.Reading_DateTime__c || b.CreatedDate) - new Date(a.Reading_DateTime__c || a.CreatedDate);
  })[0];

  const currentMeterVal =
    latestReadingRecord?.Current_Reading__c ??
    tenant?.Latest_Reading__c ??
    tenant?.Initial_Reading__c ??
    0;

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-12 w-32 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800">{error || 'Tenant not found'}</h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-xs">
                {tenant.Room_Number__c}
              </span>
              <h1 className="text-base font-bold text-slate-900 truncate max-w-[170px]">
                {tenant.Name}
              </h1>
            </div>
            <p className="text-[11px] text-slate-500">Meter: {tenant.Meter_Number__c || 'N/A'}</p>
          </div>
        </div>

        <button
          onClick={() => setIsReadingModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reading</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Tenant Summary Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                tenant.Status__c === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {tenant.Status__c || 'Active'}
            </span>

            {tenant.Phone_Number__c && (
              <a
                href={`tel:${tenant.Phone_Number__c}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{tenant.Phone_Number__c}</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="bg-slate-50 rounded-2xl p-2.5">
              <span className="text-[10px] text-slate-500 block font-medium">Current Reading</span>
              <strong className="text-sm font-bold text-slate-900 font-mono">
                {currentMeterVal}
              </strong>
            </div>

            <div className="bg-slate-50 rounded-2xl p-2.5">
              <span className="text-[10px] text-slate-500 block font-medium">Total Units</span>
              <strong className="text-sm font-bold text-slate-900 font-mono">{totalUnits}</strong>
            </div>

            <div
              className={`rounded-2xl p-2.5 ${
                totalDues > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <span className="text-[10px] block font-medium opacity-80">Pending Due</span>
              <strong className="text-sm font-extrabold font-mono">
                ₹{totalDues.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        {/* Section Header with Sort and View Toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reading History ({readings.length})
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))
              }
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold active:scale-95 transition-all"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            <button
              onClick={() => setViewMode((prev) => (prev === 'cards' ? 'table' : 'cards'))}
              className="p-1 rounded-lg bg-slate-200/70 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
              title="Toggle View Mode"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        {sortedReadings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No readings logged yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Baseline reading at move-in was{' '}
                <strong className="font-mono text-slate-800">{tenant.Initial_Reading__c || 0}</strong> units.
              </p>
            </div>
            <button
              onClick={() => setIsReadingModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Reading</span>
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* Mobile Card View */
          <div className="space-y-3">
            {sortedReadings.map((reading, index) => {
              const readingDate = new Date(reading.Reading_DateTime__c || reading.CreatedDate);
              const isPaid = reading.Payment_Status__c === 'Paid';

              return (
                <div
                  key={reading.Id || index}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3"
                >
                  {/* Card Header: Reading Index/ID & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {readingDate.toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Paid status toggle button */}
                    <button
                      onClick={() => handleTogglePaymentStatus(reading)}
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3px]" />
                          <span>Paid</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>Pending</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Meter Reading Math Grid */}
                  <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-slate-50 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Prev</span>
                      <span className="font-mono font-semibold text-slate-700">
                        {reading.Previous_Reading__c}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Current</span>
                      <span className="font-mono font-bold text-slate-900">
                        {reading.Current_Reading__c}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Units</span>
                      <span className="font-mono font-bold text-amber-700">
                        {reading.Units_Consumed__c}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Bill Due</span>
                      <span className="font-mono font-extrabold text-emerald-700">
                        ₹{reading.Total_Amount__c}
                      </span>
                    </div>
                  </div>

                  {/* Rate breakdown subtext */}
                  <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                    <span>
                      Formula: {reading.Units_Consumed__c} units × ₹{reading.Rate_Per_Unit__c}/unit
                    </span>
                    {reading.Notes__c && (
                      <span className="text-slate-400 italic truncate max-w-[140px]">
                        "{reading.Notes__c}"
                      </span>
                    )}
                  </div>

                  {/* Meter Photo & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      {reading.Meter_Image_URL__c ? (
                        <button
                          onClick={() => {
                            setSelectedPhoto(reading.Meter_Image_URL__c);
                            setSelectedReadingForPhoto(reading);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-all border border-amber-200/70"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                          <span>View Meter Photo</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] text-slate-400 bg-slate-100">
                          <ImageOff className="w-3 h-3" />
                          <span>Photo not uploaded by owner</span>
                        </span>
                      )}
                    </div>

                    <WhatsAppShare tenant={tenant} reading={reading} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-2">Prev</th>
                    <th className="py-2.5 px-2">Curr</th>
                    <th className="py-2.5 px-2">Units</th>
                    <th className="py-2.5 px-2">Rate</th>
                    <th className="py-2.5 px-2">Total</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-3">Photo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedReadings.map((r, i) => {
                    const isPaid = r.Payment_Status__c === 'Paid';
                    return (
                      <tr key={r.Id || i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                          {new Date(r.Reading_DateTime__c || r.CreatedDate).toLocaleDateString(
                            'en-IN',
                            { day: 'numeric', month: 'short' }
                          )}
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-600">
                          {r.Previous_Reading__c}
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-slate-900">
                          {r.Current_Reading__c}
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-amber-700">
                          {r.Units_Consumed__c}
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-600">
                          ₹{r.Rate_Per_Unit__c}
                        </td>
                        <td className="py-3 px-2 font-mono font-extrabold text-emerald-700 whitespace-nowrap">
                          ₹{r.Total_Amount__c}
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => handleTogglePaymentStatus(r)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPaid ? 'Paid' : 'Due'}
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          {r.Meter_Image_URL__c ? (
                            <button
                              onClick={() => {
                                setSelectedPhoto(r.Meter_Image_URL__c);
                                setSelectedReadingForPhoto(r);
                              }}
                              className="text-amber-600 font-bold hover:underline"
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No photo</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Reading Modal */}
      <ReadingModal
        isOpen={isReadingModalOpen}
        onClose={() => setIsReadingModalOpen(false)}
        tenant={tenant}
        onSuccess={fetchTenantData}
      />

      {/* Image Modal Lightbox */}
      <ImageModal
        isOpen={Boolean(selectedPhoto)}
        onClose={() => {
          setSelectedPhoto(null);
          setSelectedReadingForPhoto(null);
        }}
        imageUrl={selectedPhoto}
        reading={selectedReadingForPhoto}
      />
    </div>
  );
}
