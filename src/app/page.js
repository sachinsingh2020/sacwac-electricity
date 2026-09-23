'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import TenantCard from '@/components/TenantCard';
import ReadingModal from '@/components/ReadingModal';
import { TenantCardSkeleton, DotPulse } from '@/components/Loaders';
import { Plus, Search, Building2, Zap, Users } from 'lucide-react';

export default function HomePage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantForReading, setSelectedTenantForReading] = useState(null);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);

  const fetchTenants = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tenants');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tenants');
      if (data.tenants) setTenants(data.tenants);
    } catch (err) {
      console.error('Failed to load tenants:', err);
      setError(err.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleOpenAddReading = (tenant) => {
    setSelectedTenantForReading(tenant);
    setIsReadingModalOpen(true);
  };

  const filteredTenants = tenants.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.Name?.toLowerCase().includes(q) ||
      t.Room_Number__c?.toLowerCase().includes(q) ||
      t.Meter_Number__c?.toLowerCase().includes(q)
    );
  });

  const totalDues = tenants.reduce((sum, t) => sum + (Number(t.Pending_Dues__c) || 0), 0);
  const activeTenantsCount = tenants.filter((t) => t.Status__c === 'Active').length;

  return (
    <div>
      <Header onRefresh={() => fetchTenants(true)} refreshing={refreshing} />

      <div className="px-4 py-4 space-y-4">

        {/* Top Summary Banner */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-100 font-semibold">
                Total Unpaid Bills
              </span>
              <div className="text-3xl font-extrabold tracking-tight mt-0.5">
                {loading ? <DotPulse /> : `₹${totalDues.toLocaleString('en-IN')}`}
              </div>
            </div>
            <Link
              href="/tenants/new"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-amber-700 hover:bg-amber-50 font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>Add Room</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-amber-400/40 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-400/30">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-amber-100 text-[10px]">Active Tenants</span>
                <p className="font-bold text-sm leading-none">
                  {loading ? '—' : `${activeTenantsCount} rooms`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-400/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-amber-100 text-[10px]">Total Rooms</span>
                <p className="font-bold text-sm leading-none">
                  {loading ? '—' : `${tenants.length} recorded`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by room or tenant name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-2xs focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            All Rooms {!loading && `(${filteredTenants.length})`}
          </h2>
          {refreshing && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Refreshing...</span>
            </div>
          )}
          {!refreshing && <span className="text-xs text-slate-500">Tap room for history</span>}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium text-center">
            ⚠️ {error}
            <button
              onClick={() => fetchTenants()}
              className="block mx-auto mt-2 text-xs underline font-bold"
            >
              Try again
            </button>
          </div>
        )}

        {/* Tenants List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => <TenantCardSkeleton key={n} />)}
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {searchQuery ? 'No matching rooms found' : 'No tenants added yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                {searchQuery
                  ? 'Try searching with a different room number or tenant name.'
                  : 'Add your first room tenant to start tracking meter readings.'}
              </p>
            </div>
            {!searchQuery && (
              <Link
                href="/tenants/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Tenant</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTenants.map((tenant) => (
              <TenantCard
                key={tenant.Id}
                tenant={tenant}
                onAddReading={handleOpenAddReading}
              />
            ))}
          </div>
        )}
      </div>

      <ReadingModal
        isOpen={isReadingModalOpen}
        onClose={() => setIsReadingModalOpen(false)}
        tenant={selectedTenantForReading}
        onSuccess={() => fetchTenants(true)}
      />
    </div>
  );
}
