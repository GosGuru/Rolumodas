import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
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
// Import the React variant of Vercel Analytics since this project uses
// React Router instead of Next.js. The React build doesn't rely on
// Next.js-specific APIs like `useParams`, which caused build errors.
import { Analytics } from "@vercel/analytics/react"

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
            <div className="flex flex-col min-h-screen bg-background text-foreground" style={{ paddingTop: '60px' }}>
              <Helmet>
                <title>Rolu Modas - Moda Femenina Exclusiva</title>
                <meta name="description" content="Descubre las últimas tendencias en moda femenina. Ropa exclusiva, accesorios únicos y estilo incomparable en Rolu Modas." />
              </Helmet>
              
              <HeaderWrapper openSearchModal={openSearchModal} />
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
                  <Route path="/admin" element={<AdminPanel />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="pedidos" element={<AdminOrdersPage />} />
                    <Route path="informes" element={<AdminReportsPage />} />
                    <Route path="gestion" element={<AdminGestionPage />} />
                  </Route>
                  <Route path="/terminos" element={<TermsPage />} />
                  <Route path="/privacidad" element={<PrivacyPage />} />
                  <Route path="/orden-confirmada" element={<OrderConfirmationPage />} />
                  <Route path="/estado-pago" element={<OrderStatusPage />} />
                </Routes>
              </main>
              <Footer />
              <CartDrawer />
              <SearchModal isOpen={isSearchModalOpen} onClose={closeSearchModal} />
              <NewsletterButton />
              <AuthAwareWhatsAppButton phoneNumber="+59897358715" />
              <Toaster />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
