import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, BarChart2, Wrench, Eye, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/admin/gestion', icon: Wrench, label: 'Gestión' },
  { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/admin/detalles', icon: Eye, label: 'Detalles' },
  { to: '/admin/informes', icon: BarChart2, label: 'Informes' },
];

const DashboardMobileNav = () => {
  const { logout } = useAuth();
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-[#0F172A] border-t border-gray-800 shadow-2xl flex justify-around items-center py-1 sm:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-2 py-2 text-xs font-semibold transition-all duration-200 rounded-none border-b-4 outline-none focus:ring-2 focus:ring-yellow-400 ${isActive ? 'bg-black border-b-4 border-yellow-400 text-white font-bold' : 'text-yellow-400 border-transparent hover:bg-yellow-700/10 hover:text-white'}`
          }
        >
          <Icon className="w-6 h-6" />
          <span>{label}</span>
        </NavLink>
      ))}
      <button onClick={async () => { await logout(); window.location.href = '/'; }} className="absolute right-4 bottom-3 bg-transparent border-none outline-none">
        <LogOut className="w-7 h-7 text-yellow-400 hover:text-white transition-colors" />
      </button>
    </nav>
  );
};

export default DashboardMobileNav;