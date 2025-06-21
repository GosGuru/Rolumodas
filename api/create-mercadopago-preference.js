import { createClient } from '@supabase/supabase-js';
import mercadopago from 'mercadopago';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res
      .status(405)
      .setHeader('Allow', 'POST')
      .json({ message: 'Method Not Allowed' });
  }

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'MERCADOPAGO_ACCESS_TOKEN',
  ];
  required.forEach((n) => {
    if (!process.env[n]) throw new Error(`Missing env var: ${n}`);
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  const supabase = createClient(supabaseUrl, serviceKey);
  mercadopago.configure({ access_token: mpToken });

  try {
    const { items = [], shipping_method } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid items' });
    }

    const preferenceItems = items.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      currency_id: 'UYU',
      unit_price: item.price,
    }));

    const totalAmount = preferenceItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    const mpPreference = await mercadopago.preferences.create({
      items: preferenceItems,
    });

    const preferenceId = mpPreference.body.id;

    const orderData = {
      order_number: crypto.randomUUID(),
      items: preferenceItems,
      total_amount: totalAmount,
      status: 'pending',
      payment_method: 'mercadopago',
      payment_id: preferenceId,
      payment_status: 'pending',
      shipping_method: shipping_method || null,
    };

    const { error } = await supabase.from('orders').insert([orderData]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Error creating order' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ preferenceId });
  } catch (err) {
    console.error(err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ message: err.message });
  }
}
