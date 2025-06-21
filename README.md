# Rolumodas

## Serverless Proxy for Mercado Pago

This project uses a Vercel serverless function to create Mercado Pago
preferences without running into CORS issues. Configure the following
environment variables in your hosting platform:
called from the checkout page. It now accepts a `max_installments` value
so that the admin can limit the number of Mercado Pago installments.

The limit is stored in the `site_content` table with the key
`mp_max_installments` and can be managed from the admin dashboard.



- `SUPABASE_URL` – your Supabase project URL.
- `SUPABASE_SERVICE_KEY` – a service role key with permission to invoke
  functions.

The function lives at `api/create-mercadopago-preference.js` and is
called from the checkout page. It now accepts a `max_installments` value
so that the admin can limit the number of Mercado Pago installments.

The limit is stored in the `site_content` table with the key
`mp_max_installments` and can be managed from the admin dashboard.
