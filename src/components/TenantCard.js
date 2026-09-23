'use client';
import Link from 'next/link';
import { Gauge, Phone, Plus, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TenantCard({ tenant, onAddReading }) {
  const pendingDues = Number(tenant.Pending_Dues__c) || 0;
  const latestReading = Number(tenant.Latest_Reading__c) || Number(tenant.Initial_Reading__c) || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
              {tenant.Room_Number__c}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                tenant.Status__c === 'Active'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tenant.Status__c || 'Active'}
            </span>
          </div>
          <Link href={`/tenants/${tenant.Id}`} className="block mt-1">
            <h3 className="text-base font-bold text-slate-900 hover:text-amber-600 transition-colors">
              {tenant.Name}
            </h3>
          </Link>
        </div>

        {/* Dues badge */}
        <div className="text-right">
          {pendingDues > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/70">
              <AlertCircle className="w-3.5 h-3.5" />
              ₹{pendingDues.toLocaleString('en-IN')} Due
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Paid
            </span>
          )}
        </div>
      </div>

      {/* Meter reading and contact details */}
      <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl mb-3 text-xs">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Last Reading</div>
            <div className="font-bold text-slate-800 text-sm">{latestReading} <span className="text-[10px] font-normal text-slate-500">units</span></div>
          </div>
        </div>

        {tenant.Phone_Number__c ? (
          <a
            href={`tel:${tenant.Phone_Number__c}`}
            className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors"
          >
            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] text-slate-500 font-medium">Call Tenant</div>
              <div className="font-semibold truncate">{tenant.Phone_Number__c}</div>
            </div>
          </a>
        ) : (
          <div className="text-slate-400 italic text-[11px] self-center">No phone added</div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={() => onAddReading(tenant)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Reading</span>
        </button>

        <Link
          href={`/tenants/${tenant.Id}`}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs active:scale-95 transition-all"
        >
          <span>History</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
