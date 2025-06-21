# Rolumodas

## Serverless Proxy for Mercado Pago

This project uses a Vercel serverless function to create Mercado Pago
preferences without running into CORS issues. Configure the following
environment variables in your hosting platform:

- `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` – a service role key with permission to invoke
  functions.
- `MERCADOPAGO_ACCESS_TOKEN` – access token for the Mercado Pago SDK.

The function lives at `api/create-mercadopago-preference.js` and is
called from the checkout page. A `405` response is returned if you use
any HTTP method other than `POST`.
