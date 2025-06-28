import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, BarChart2, Wrench, Eye } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/admin/dashboard?tab=pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/admin/dashboard?tab=detalles-pedido', icon: Eye, label: 'Detalles' },
  { to: '/admin/dashboard?tab=informes', icon: BarChart2, label: 'Informes' },
  { to: '/admin/dashboard?tab=gestion', icon: Wrench, label: 'Gestión' },
];

const DashboardMobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white/95 border-t border-gray-200 shadow-2xl flex justify-around items-center py-1 sm:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-2 py-1 text-xs font-semibold transition-colors duration-150 rounded-md ${isActive ? 'text-primary bg-gray-100 shadow font-bold' : 'text-gray-500 hover:text-primary'}`
          }
        >
          <Icon className="w-6 h-6 mb-0.5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default DashboardMobileNav; 