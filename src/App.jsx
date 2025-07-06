import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
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
import WhatsAppButton from './components/WhatsAppButton';
import OrderDetailsTab from '@/components/admin/OrderDetailsTab';
import { Analytics } from "@vercel/analytics/react";
import AppLayout from './AppLayout';

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
            <AppLayout
              isSearchModalOpen={isSearchModalOpen}
              openSearchModal={openSearchModal}
              closeSearchModal={closeSearchModal}
            />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
