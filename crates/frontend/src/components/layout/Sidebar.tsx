import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Compass, Bookmark, Users, Brain, Newspaper, GitBranch, Settings, Package } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',           label: 'Home',       icon: Home },
  { to: '/explore',    label: 'Explore',    icon: Compass },
  { to: '/directory',  label: 'Saved',      icon: Bookmark },
  { to: '/community',  label: 'Community',  icon: Users },
  { to: '/models',     label: 'Models',     icon: Brain },
  { to: '/news',       label: 'News',       icon: Newspaper },
  { to: '/workflows',  label: 'Workflows',  icon: GitBranch },
];

export const Sidebar: React.FC<{ onOpenVault?: () => void; vaultCount?: number }> = ({ onOpenVault, vaultCount }) => {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0 bg-white rounded-3xl m-3 mr-0 shadow-sm border border-gray-100 overflow-hidden">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0A0A0A] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="font-black text-[#0A0A0A] text-lg tracking-tight">BinBag</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Vault / collections shortcut */}
        <div className="px-3 pb-3">
          <button
            onClick={onOpenVault}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <Package className="w-4 h-4 shrink-0 text-gray-400" />
            <span>Collections</span>
            {vaultCount ? (
              <span className="ml-auto bg-[#4F46E5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {vaultCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* Settings + user strip */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <Settings className="w-4 h-4 shrink-0 text-gray-400" />
            <span>Settings</span>
          </NavLink>
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              Y
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">You</p>
              <p className="text-[10px] text-gray-400">Free plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 safe-area-pb">
        {NAV_ITEMS.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-[#0A0A0A]' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#0A0A0A]' : 'text-gray-400'}`} />
                <span className="text-[9px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};
