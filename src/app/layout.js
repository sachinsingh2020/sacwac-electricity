import './globals.css';
import BottomNav from '@/components/BottomNav';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'Bijli Tracker - Electricity & Room Rent Manager',
  description: 'Track electricity meter readings, calculate bills dynamically, and manage tenants with Salesforce.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 min-h-screen text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900">
        <div className="max-w-md sm:max-w-xl mx-auto min-h-screen flex flex-col bg-slate-50 shadow-xl border-x border-slate-200">
          <main className="flex-1 pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
