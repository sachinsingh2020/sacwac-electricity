'use client';
import { X, ExternalLink, ImageOff } from 'lucide-react';

export default function ImageModal({ isOpen, onClose, imageUrl, reading }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-slate-900 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">
              {reading ? `${reading.Name || 'Meter Reading'}` : 'Meter Photo'}
            </h4>
            {reading?.Reading_DateTime__c && (
              <p className="text-xs text-slate-400">
                {new Date(reading.Reading_DateTime__c).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Image Content */}
        <div className="p-4 flex items-center justify-center min-h-[300px] max-h-[70vh] bg-black/40 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Meter Reading Proof"
              className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                <ImageOff className="w-7 h-7" />
              </div>
              <h5 className="text-sm font-semibold text-slate-200">Photo not uploaded by owner</h5>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                No meter photo was captured when logging this reading record.
              </p>
            </div>
          )}
        </div>

        {/* Footer info & external link */}
        {imageUrl && (
          <div className="flex items-center justify-between p-3.5 bg-slate-950 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              Units: <strong className="text-white">{reading?.Units_Consumed__c || 0}</strong> • Bill:{' '}
              <strong className="text-emerald-400">₹{reading?.Total_Amount__c || 0}</strong>
            </span>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-amber-400 hover:underline font-medium"
            >
              <span>Full Resolution</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
