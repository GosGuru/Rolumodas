import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WhatsAppButton from './WhatsAppButton';

const AuthAwareWhatsAppButton = ({ phoneNumber }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) return null;
  return <WhatsAppButton phoneNumber={phoneNumber} />;
};

export default AuthAwareWhatsAppButton; 