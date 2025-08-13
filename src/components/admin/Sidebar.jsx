import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wrench, ShoppingBag, Eye, BarChart2 } from 'lucide-react';

const navItems = [
  { to: '/admin/gestion', icon: Wrench, label: 'Gestión' },
  { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/admin/detalles', icon: Eye, label: 'Detalles' },
  { to: '/admin/informes', icon: BarChart2, label: 'Informes' },
];

const Sidebar = () => (
  <aside className="hidden md:flex flex-col w-56 min-h-screen bg-[#0F172A] gap-2 fixed top-0 left-0 z-40">
    <div className="pt-16">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-none cursor-pointer transition-all duration-200 outline-none focus:ring-2 focus:ring-yellow-400
            ${isActive ? 'bg-black border-l-4 border-yellow-400 text-white font-bold' : 'text-yellow-400 border-l-4 border-transparent hover:bg-yellow-700/10 hover:text-white'}`
          }
        >
          <Icon className="w-6 h-6" />
          {label}
        </NavLink>
      ))}
    </div>
  </aside>
);

export default Sidebar;