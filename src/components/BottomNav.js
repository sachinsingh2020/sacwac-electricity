'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserPlus, Sliders, Zap } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Rooms', href: '/', icon: Home },
    { label: 'Add Room', href: '/tenants/new', icon: UserPlus },
    { label: 'Unit Rate', href: '/rate', icon: Zap },
    { label: 'Settings', href: '/settings', icon: Sliders },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg pb-safe">
      <div className="max-w-xl mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-all ${
                isActive
                  ? 'text-amber-600 scale-105 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
