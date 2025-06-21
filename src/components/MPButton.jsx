import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { loadMpSdk } from "@/lib/loadMpSdk";

export default function MPButton({ preferenceId, onSuccess }) {
  const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
  const [ready, setReady] = useState(false);

  // Precarga al montar
  useEffect(() => {
    loadMpSdk(publicKey).then(() => setReady(true));
  }, [publicKey]);

  const handlePay = async () => {
    const MP = await loadMpSdk(publicKey); // garantizado
    const mp = new MP(publicKey, { locale: "es-UY" });

    mp.checkout({
      preference: { id: preferenceId },
      renderMode: "modal",
      autoOpen: true,
      theme: {
        elementsColor: "#9333ea",
        headerColor: "#111827",
        mainColor: "#9333ea",
      },
      onSubmit: () => onSuccess?.(),
    });
  };

  return (
    <Button
      disabled={!ready}
      onClick={handlePay}
      onMouseEnter={() => loadMpSdk(publicKey)} // pre‑load en hover
      className="w-full text-white bg-primary disabled:opacity-50"
    >
      {ready ? "Pagar con Mercado Pago" : "Cargando…"}
    </Button>
  );
}
