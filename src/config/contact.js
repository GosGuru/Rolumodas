// Centralized contact configuration
// Default WhatsApp number (international format without +)
export const WHATSAPP_NUMBER = '59897358715';

// Helper to build a wa.me link with optional prefilled text
export const getWhatsAppLink = (text) => {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
};
