
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Loader2, DollarSign, ShoppingCart, TrendingUp, BarChart2 } from 'lucide-react';

const ReportCard = ({ icon: Icon, title, value, bgColor, iconColor }) => (
  <div className="bg-gray-800 p-6 shadow-sm text-white">
    <div className="flex items-center">
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <Icon className={`h-7 w-7 ${iconColor}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const AdminReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, status, items, created_at')
      .in('status', ['completed', 'processing']);

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los datos para los informes.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const totalRevenue = data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const totalOrders = data.length;
    
    const productSales = data.flatMap(order => order.items).reduce((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
      return acc;
    }, {});

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const salesByMonth = data.reduce((acc, order) => {
      const month = new Date(order.created_at).toLocaleString('es-UY', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + parseFloat(order.total_amount);
      return acc;
    }, {});

    setReports({
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      topProducts,
      salesByMonth,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>Informes - Rolu Modas</title>
      </Helmet>
      <div className="bg-gray-900 p-6 shadow-sm border border-gray-700 text-white">
        <h2 className="text-2xl font-bold mb-6">Informes de Ventas</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !reports ? (
          <div className="text-center py-16">
            <BarChart2 className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium">No hay datos suficientes</h3>
            <p className="mt-1 text-sm text-gray-400">Se necesitan pedidos completados para generar informes.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard
                icon={DollarSign}
                title="Ingresos Totales"
                value={formatPrice(reports.totalRevenue)}
                bgColor="bg-green-500/20"
                iconColor="text-green-400"
              />
              <ReportCard
                icon={ShoppingCart}
                title="Pedidos Totales"
                value={reports.totalOrders}
                bgColor="bg-blue-500/20"
                iconColor="text-blue-400"
              />
              <ReportCard
                icon={TrendingUp}
                title="Valor Promedio Pedido"
                value={formatPrice(reports.averageOrderValue)}
                bgColor="bg-purple-500/20"
                iconColor="text-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">Productos Más Vendidos</h3>
                <ul className="space-y-3">
                  {reports.topProducts.map(([name, quantity], index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                      <span>{index + 1}. {name}</span>
                      <span className="font-bold bg-gray-700 px-2 py-1 text-xs">{quantity} vendidos</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">Ventas por Mes</h3>
                <ul className="space-y-3">
                  {Object.entries(reports.salesByMonth).map(([month, sales], index) => (
                    <li key={index} className="flex justify-between items-center text-sm capitalize">
                      <span>{month}</span>
                      <span className="font-bold">{formatPrice(sales)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminReportsPage;
