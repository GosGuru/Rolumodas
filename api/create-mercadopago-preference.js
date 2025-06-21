import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig } from "mercadopago";
import { preferences } from "mercadopago/resources/preferences";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .setHeader("Allow", "POST")
      .json({ message: "Method Not Allowed" });
  }

  try {
    // Validar variables de entorno primero
    const required = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "MERCADOPAGO_ACCESS_TOKEN",
    ];
    required.forEach((n) => {
      if (!process.env[n]) throw new Error(`Missing env var: ${n}`);
    });

    // Inicializar clientes externos
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    const supabase = createClient(supabaseUrl, serviceKey);
    const mp = new MercadoPagoConfig({
      accessToken: mpToken,
      options: { timeout: 5000 },
    });
    mp.preferences = preferences;

    // Tomar datos del body
    const { items = [], shipping_method } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid items" });
    }

    const preferenceItems = items.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      currency_id: "UYU",
      unit_price: item.price,
    }));

    const totalAmount = preferenceItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    // Crear preferencia en MercadoPago
    const mpPreference = await mp.preferences.create({
      body: { items: preferenceItems },
    });

    const preferenceId = mpPreference.id;

    // Guardar orden en Supabase
    const orderData = {
      order_number: crypto.randomUUID(),
      items: preferenceItems,
      total_amount: totalAmount,
      status: "pending",
      payment_method: "mercadopago",
      payment_id: preferenceId,
      payment_status: "pending",
      shipping_method: shipping_method || null,
    };

    const { error } = await supabase.from("orders").insert([orderData]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ message: "Error creating order" });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ preferenceId });
  } catch (err) {
    console.error("Server error:", err);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ message: err.message || "Internal error" });
  }
}
