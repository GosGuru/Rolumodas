
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import Header from '@/components/Header';
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
import WhatsAppButton from '@/components/WhatsAppButton';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import OrderStatusPage from '@/pages/OrderStatusPage';
import AdminOrdersPage from '@/pages/AdminOrdersPage';
import AdminReportsPage from '@/pages/AdminReportsPage';
import { Analytics } from "@vercel/analytics/next"

function App() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
        <Analytics />
          <Router>
            <div className="flex flex-col min-h-screen bg-background text-foreground">
              <Helmet>
                <title>Rolu Modas - Moda Femenina Exclusiva</title>
                <meta name="description" content="Descubre las últimas tendencias en moda femenina. Ropa exclusiva, accesorios únicos y estilo incomparable en Rolu Modas." />
              </Helmet>
              
              <Header openSearchModal={openSearchModal} />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/tienda" element={<ShopPage />} />
                  <Route path="/categoria/:slug" element={<CategoryPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/favoritos" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/producto/:id" element={<ProductPage />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
                  <Route path="/admin/informes" element={<AdminReportsPage />} />
                  <Route path="/terminos" element={<TermsPage />} />
                  <Route path="/privacidad" element={<PrivacyPage />} />
                  <Route path="/orden-confirmada" element={<OrderConfirmationPage />} />
                  <Route path="/estado-pago" element={<OrderStatusPage />} />
                </Routes>
              </main>
              <Footer />
              <CartDrawer />
              <SearchModal isOpen={isSearchModalOpen} onClose={closeSearchModal} />
              <WhatsAppButton phoneNumber="+59897358715" />
              <Toaster />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
