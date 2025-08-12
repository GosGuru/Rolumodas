import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "@/components/ui/use-toast";

// Formato específico solicitado: "UYU 200" (sin símbolo $) o ajustable según necesidad
const formatPrice = (price) => {
  if (price == null) return "";
  const base = new Intl.NumberFormat("es-UY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return `UYU $${base}`; // Cambiar aquí si quieres incluir decimales o símbolo
};

/**
 * ProductCard
 * - Modo grid por defecto.
 * - listMode: variante horizontal (wishlist)
 * - Sin bordes redondeados en la imagen (requisito actual)
 */
export default function ProductCard({ product, index = 0, listMode = false }) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const inStock =
    product?.inStock != null
      ? Boolean(product.inStock)
      : typeof product?.stock === "number"
      ? product.stock > 0
      : true;
  const inWishlist = isInWishlist(product.id);
  const image =
    product.images?.[0] ||
    "https://placehold.co/600x600/000000/FFFFFF?text=Rolu";

  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault();
      addToCart(product, 1);
      toast({
        title: "Producto agregado",
        description: `${product.name} se agregó a tu carrito.`,
        className: "bg-black text-white border-gray-700 font-negro",
      });
    },
    [addToCart, product]
  );

  const handleToggleWishlist = useCallback(
    (e) => {
      e.preventDefault();
      addToWishlist(product);
      toast({
        title: inWishlist ? "Removido de Favoritos" : "Añadido a Favoritos",
        description: `${product.name} se ${
          inWishlist ? "eliminó de" : "agregó a"
        } tus favoritos.`,
        className: "bg-black text-white border-gray-700 font-negro",
      });
    },
    [addToWishlist, inWishlist, product]
  );

  if (!product) return null;

  // Variante lista (horizontal)
  if (listMode) {
    return (
      <Link to={`/producto/${product.id}`} className="group">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex items-center gap-4 p-3 transition-shadow border border-border bg-background hover:shadow-sm"
        >
          <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden bg-muted">
            <img
              src={image}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/600x600/000000/FFFFFF?text=Rolu";
                e.target.onerror = null;
              }}
            />
            {!inStock && (
              <span className="absolute inset-0 grid text-[10px] font-semibold tracking-wide text-white uppercase bg-black/70 place-items-center">
                Agotado
              </span>
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h3 className="text-sm font-medium leading-tight truncate text-foreground">
              {product.name}
            </h3>
            <p className="mt-1 text-[13px] font-semibold text-foreground">
              {formatPrice(product.price)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center h-8 px-3 text-xs font-medium transition-colors border rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                disabled={!inStock}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`h-8 w-8 flex items-center justify-center rounded-full border border-border transition-colors ${
                  inWishlist
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={
                  inWishlist ? "Quitar de favoritos" : "Añadir a favoritos"
                }
              >
                <Heart
                  className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Variante grid
  return (
    <Link to={`/producto/${product.id}`} className="w-full select-none group">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex flex-col w-full bg-background"
      >
        <div className="relative w-full overflow-hidden aspect-square bg-muted">
          <img
            src={image}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src =
                "https://placehold.co/600x600/000000/FFFFFF?text=Rolu";
              e.target.onerror = null;
            }}
          />
          {!inStock && (
            <span className="absolute inset-0 grid text-[10px] font-semibold tracking-wide text-white uppercase bg-black/70 place-items-center">
              Agotado
            </span>
          )}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background/70 backdrop-blur border border-border transition-colors ${
              inWishlist
                ? "text-red-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={
              inWishlist ? "Quitar de favoritos" : "Añadir a favoritos"
            }
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="flex flex-col flex-1 mt-2">
          <h3 className="text-[17.5px] eading-tight truncate ">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[17.5px] ">{formatPrice(product.price)}</p>
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center text-black transition-colors duration-300 border rounded-full w-9 h-9 border-border hover:text-opacity-60 hover:bg-accent disabled:opacity-60"
              aria-label="Añadir al carrito"
              disabled={!inStock}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export const ProductCardCompact = ProductCard;
