import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import FaqPage from '@/pages/FaqPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ProductPage from '@/pages/ProductPage';
import CategoryPage from '@/pages/CategoryPage';
import WishlistPage from '@/pages/WishlistPage';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import NewsletterButton from '@/components/NewsletterButton';
import AuthAwareWhatsAppButton from '@/components/AuthAwareWhatsAppButton';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import OrderStatusPage from '@/pages/OrderStatusPage';
import AdminOrdersPage from '@/pages/AdminOrdersPage';
import AdminReportsPage from '@/pages/AdminReportsPage';
import AdminPanel, { AdminGestionPage } from '@/pages/AdminPanel';
import OrderDetailsTab from '@/components/admin/OrderDetailsTab';
import { Toaster } from '@/components/ui/toaster';

const AppLayout = ({ isSearchModalOpen, openSearchModal, closeSearchModal }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Rolu Modas - Moda Femenina Exclusiva</title>
        <meta name="description" content="Descubre las últimas tendencias en moda femenina. Ropa exclusiva, accesorios únicos y estilo incomparable en Rolu Modas." />
      </Helmet>
      <HeaderWrapper openSearchModal={openSearchModal} />
      <main className="flex-1 pt-17">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tienda" element={<ShopPage />} />
          <Route path="/categoria/:slug" element={<CategoryPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/favoritos" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/producto/:id" element={<ProductPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pedidos" element={<AdminOrdersPage />} />
            <Route path="detalles" element={<OrderDetailsTab />} />
            <Route path="informes" element={<AdminReportsPage />} />
            <Route path="gestion" element={<AdminGestionPage />} />
          </Route>
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/orden-confirmada" element={<OrderConfirmationPage />} />
          <Route path="/estado-pago" element={<OrderStatusPage />} />
        </Routes>
      </main>
      { !isAdmin && <Footer /> }
      <CartDrawer />
      <SearchModal isOpen={isSearchModalOpen} onClose={closeSearchModal} />
      <NewsletterButton />
      <AuthAwareWhatsAppButton phoneNumber="59896303934" />
      <Toaster />
    </div>
  );
};

export default AppLayout; 