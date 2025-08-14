import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, BarChart2, Wrench, Eye } from 'lucide-react';

const navItems = [
  { to: '/admin/gestion', icon: Wrench, label: 'Gestión' },
  { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/admin/detalles', icon: Eye, label: 'Detalles' },
  { to: '/admin/informes', icon: BarChart2, label: 'Informes' },
];

const DashboardMobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full max-w-[100vw] bg-[#0F172A] border-t border-gray-800 shadow-2xl flex justify-around items-center py-1 sm:hidden">
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
    </nav>
  );
};

export default DashboardMobileNav;