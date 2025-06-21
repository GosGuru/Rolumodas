
import React from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Eye, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, bgColor, iconColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-gray-800 p-6 shadow-sm text-white"
  >
    <div className="flex items-center">
      <div className={`p-2 ${bgColor} rounded-lg`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-400 font-negro">{title}</p>
        <p className="text-2xl font-negro text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

const AdminStats = ({ products, formatPrice }) => {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const visibleProducts = products.filter(p => p.visible).length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={Package}
        title="Total Productos"
        value={totalProducts}
        bgColor="bg-blue-500/20"
        iconColor="text-blue-400"
        delay={0}
      />
      <StatCard
        icon={DollarSign}
        title="Valor Inventario"
        value={formatPrice(totalValue)}
        bgColor="bg-green-500/20"
        iconColor="text-green-400"
        delay={0.1}
      />
      <StatCard
        icon={Eye}
        title="Productos Visibles"
        value={visibleProducts}
        bgColor="bg-purple-500/20"
        iconColor="text-purple-400"
        delay={0.2}
      />
      <StatCard
        icon={TrendingUp}
        title="Stock Bajo"
        value={lowStockProducts}
        bgColor="bg-orange-500/20"
        iconColor="text-orange-400"
        delay={0.3}
      />
    </div>
  );
};

export default AdminStats;
