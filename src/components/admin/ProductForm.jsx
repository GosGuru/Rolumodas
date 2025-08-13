import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { UploadCloud, X, Star, Plus, Trash2 } from "lucide-react";
import { validateFiles, LIMITS } from "@/lib/validationUtils";
import ProductLimitsInfo from "@/components/ui/ProductLimitsInfo";
import VariantStockSummary from "./VariantStockSummary";
// import ColorPicker from './ColorPicker';

const ProductForm = ({
  formData,
  setFormData,
  handleSubmit,
  resetForm,
  editingProduct,
  categories,
}) => {
  // Validación defensiva: asegurar que formData siempre tenga un valor por defecto
  const safeFormData = formData || {
    name: "",
    price: "",
    description: "",
    category_id: "",
    images: [],
    stock: "",
    visible: true,
    variants: [],
    short_description: "",
    long_description: "",
    is_trending: false,
  };

  // Validación defensiva: asegurar que editingProduct existe antes de acceder a sus propiedades
  const safeEditingProduct = editingProduct || {};

  const [imagePreviews, setImagePreviews] = useState([]);

  const updatePreviews = useCallback(() => {
    if (!safeFormData.images || safeFormData.images.length === 0) {
      setImagePreviews([]);
      return;
    }

    const newPreviews = safeFormData.images
      .map((image) => {
        if (typeof image === "string") {
          return { url: image, file: null };
        } else if (image instanceof File) {
          return { url: URL.createObjectURL(image), file: image };
        }
        return null;
      })
      .filter(Boolean);

    setImagePreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) => {
        if (preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [safeFormData.images]);

  useEffect(() => {
    const cleanup = updatePreviews();
    return cleanup;
  }, [updatePreviews]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = safeFormData.images || [];
    
    if (files.length > 0) {
      // Usar las validaciones del nuevo archivo
      const validation = validateFiles(files, currentImages.length);
      
      if (!validation.isValid) {
        toast({
          title: "Error en la validación",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...validation.validFiles],
      }));
      
      toast({
        title: "Imágenes agregadas",
        description: `Se agregaron ${validation.validFiles.length} imagen(es). Total: ${currentImages.length + validation.validFiles.length}/${LIMITS.MAX_IMAGES}`,
      });
    }
  };

  const removeImage = useCallback(
    (indexToRemove) => {
      setFormData((prev) => ({
        ...prev,
        images: (prev.images || []).filter(
          (_, index) => index !== indexToRemove
        ),
      }));
    },
    [setFormData]
  );

  // Manejo de variantes avanzadas
  const handleVariantChange = (variantIndex, field, value) => {
    const newVariants = [...(safeFormData.variants || [])].map((v) => ({
      ...v,
      options: Array.isArray(v.options)
        ? v.options
        : Object.values(v.options || {}),
    }));
    if (!newVariants[variantIndex]) return;
    newVariants[variantIndex][field] = value;
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleVariantOptionChange = (
    variantIndex,
    optionIndex,
    field,
    value
  ) => {
    const newVariants = [...(safeFormData.variants || [])];
    if (!newVariants[variantIndex]) return;
    // Asegurar que options sea un array
    newVariants[variantIndex].options = Array.isArray(
      newVariants[variantIndex].options
    )
      ? newVariants[variantIndex].options
      : Object.values(newVariants[variantIndex].options || {});
    // Asegurar que exista el objeto option
    if (!newVariants[variantIndex].options[optionIndex]) {
      newVariants[variantIndex].options[optionIndex] = { label: "", value: "", stock: 0 };
    }
    
    // Actualizar el campo específico
    newVariants[variantIndex].options[optionIndex][field] = value;
    
    // Auto-completar valor cuando se cambia la etiqueta
    if (field === 'label' && value) {
      // Convertir la etiqueta a un valor más apropiado para sistemas
      const autoValue = value.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9]/g, '') // Solo letras y números
        .trim();
      
      // Solo auto-completar si el valor está vacío o es igual al valor anterior
      const currentValue = newVariants[variantIndex].options[optionIndex].value;
      if (!currentValue || currentValue === '') {
        newVariants[variantIndex].options[optionIndex].value = autoValue;
      }
    }
    
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    const currentVariants = safeFormData.variants || [];
    
    if (currentVariants.length >= LIMITS.MAX_VARIANTS) {
      toast({
        title: "Límite de variantes excedido",
        description: `Solo puedes crear un máximo de ${LIMITS.MAX_VARIANTS} variantes por producto.`,
        variant: "destructive"
      });
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          name: "",
          type: "talle",
          options: [],
        },
      ],
    }));
  };

  const removeVariant = (variantIndex) => {
    const newVariants = (safeFormData.variants || []).filter(
      (_, index) => index !== variantIndex
    );
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariantOption = (variantIndex) => {
    const newVariants = [...(safeFormData.variants || [])];
    if (!newVariants[variantIndex]) return;
    
    const currentOptions = Array.isArray(newVariants[variantIndex].options) 
      ? newVariants[variantIndex].options 
      : Object.values(newVariants[variantIndex].options || {});
    
    if (currentOptions.length >= LIMITS.MAX_OPTIONS_PER_VARIANT) {
      toast({
        title: "Límite de opciones excedido",
        description: `Solo puedes crear un máximo de ${LIMITS.MAX_OPTIONS_PER_VARIANT} opciones por variante.`,
        variant: "destructive"
      });
      return;
    }
    
    const type = newVariants[variantIndex].type;
    const newOption = { label: "", value: "", shape: "circle", size: "md", stock: 0 };
    if (type === "color") newOption.hex = "#000000";
    if (type === "imagen") newOption.image = "";
    // Asegurar que options sea un array
    newVariants[variantIndex].options = Array.isArray(
      newVariants[variantIndex].options
    )
      ? newVariants[variantIndex].options
      : Object.values(newVariants[variantIndex].options || {});
    newVariants[variantIndex].options.push(newOption);
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const removeVariantOption = (variantIndex, optionIndex) => {
    const newVariants = [...(safeFormData.variants || [])];
    if (!newVariants[variantIndex]) return;
    newVariants[variantIndex].options = Array.isArray(
      newVariants[variantIndex].options
    )
      ? newVariants[variantIndex].options
      : Object.values(newVariants[variantIndex].options || {});
    newVariants[variantIndex].options = newVariants[
      variantIndex
    ].options.filter((_, i) => i !== optionIndex);
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  // Normalizar variantes para renderizar de forma segura
  const normalizedVariants = useMemo(
    () =>
      (safeFormData.variants || []).map((v) => ({
        ...v,
        options: Array.isArray(v.options)
          ? v.options
          : Object.values(v.options || {}),
      })),
    [safeFormData.variants]
  );

  // Manejo de subida de imagen para opciones de variante tipo imagen
  const handleVariantOptionImage = async (variantIndex, optionIndex, file) => {
    if (!file) return;
    // Nombre único: variante-producto-timestamp-nombre
    const fileExt = file.name.split(".").pop();
    const fileName = `variant_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 8)}.${fileExt}`;
    const { error } = await supabase.storage
      .from("product-variants")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      window.alert("Error al subir la imagen de la variante");
      return;
    }
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from("product-variants")
      .getPublicUrl(fileName);
    if (publicUrlData && publicUrlData.publicUrl) {
      handleVariantOptionChange(
        variantIndex,
        optionIndex,
        "image",
        publicUrlData.publicUrl
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-gray-700 bg-gray-900/50"
    >
      {/* Información sobre límites */}
      <div className="p-4 border-b border-gray-700">
        <ProductLimitsInfo />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-6 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm text-gray-300 font-negro"
            >
              Nombre del Producto
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={safeFormData.name}
              onChange={handleInputChange}
              className="bg-[#23272f] text-white border border-gray-700 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 rounded-lg px-3 py-2 w-full"
              autoComplete="off"
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="block mb-1 text-sm text-gray-300 font-negro"
            >
              Precio (UYU)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              value={safeFormData.price}
              onChange={handleInputChange}
              className="bg-[#23272f] text-white border border-gray-700 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 rounded-lg px-3 py-2 w-full"
              inputMode="decimal"
            />
          </div>
          <div>
            <label
              htmlFor="category_id"
              className="block mb-1 text-sm text-gray-300 font-negro"
            >
              Categoría
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              value={safeFormData.category_id}
              onChange={handleInputChange}
              className="bg-[#23272f] text-white border border-gray-700 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 rounded-lg px-3 py-2 w-full"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="stock"
              className="block mb-1 text-sm text-gray-300 font-negro"
            >
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              required
              min="0"
              value={safeFormData.stock}
              onChange={handleInputChange}
              className="bg-[#23272f] text-white border border-gray-700 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 rounded-lg px-3 py-2 w-full"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* NUEVO: Descripción corta */}
        <div>
          <label
            htmlFor="short_description"
            className="block mb-1 text-sm text-gray-300 font-negro"
          >
            Descripción corta{" "}
            <span className="text-gray-400">(máx. 160 caracteres)</span>
          </label>
          <textarea
            id="short_description"
            name="short_description"
            rows={2}
            maxLength={160}
            value={safeFormData.short_description || ""}
            onChange={handleInputChange}
            className="bg-[#23272f] text-white border border-gray-700 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 rounded-lg px-3 py-2 w-full"
            placeholder="Ej: Remera oversize de algodón premium. Ideal para el día a día."
          />
          <div className="mt-1 text-xs text-right text-gray-400">
            {safeFormData.short_description?.length || 0}/160
          </div>
        </div>

        {/* NUEVO: Descripción larga */}
        <div>
          <label
            htmlFor="long_description"
            className="block mb-1 text-sm text-gray-300 font-negro"
          >
            Descripción larga <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            id="long_description"
            name="long_description"
            rows={5}
            value={safeFormData.long_description || ""}
            onChange={handleInputChange}
            className="bg-[#23272f] text-white border border-gray-700 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 rounded-lg px-3 py-2 w-full"
            placeholder="Agrega detalles, materiales, cuidados, inspiración, etc."
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300 font-negro">
            Imágenes del Producto
            <span className="ml-2 text-xs text-gray-400">
              ({imagePreviews.length}/{LIMITS.MAX_IMAGES} imágenes)
            </span>
          </label>
          <div className="mt-1">
            <div className="grid grid-cols-3 gap-4 mb-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={preview.url}
                    alt={`Vista previa ${index + 1}`}
                    className="object-cover w-full h-full border border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="absolute w-6 h-6 transition-opacity opacity-0 top-1 right-1 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <label
              htmlFor="images"
              className={`flex flex-col items-center justify-center w-full px-6 pt-5 pb-6 transition-colors border-2 border-dashed cursor-pointer ${
                imagePreviews.length >= LIMITS.MAX_IMAGES 
                  ? 'bg-gray-700 border-gray-600 cursor-not-allowed' 
                  : 'bg-gray-800 border-gray-600 hover:border-black hover:bg-black group'
              }`}
            >
              <UploadCloud className={`w-12 h-12 mb-2 transition-colors ${
                imagePreviews.length >= LIMITS.MAX_IMAGES 
                  ? 'text-gray-500' 
                  : 'text-black group-hover:text-white'
              }`} />
              <p className="text-sm text-gray-400">
                {imagePreviews.length >= LIMITS.MAX_IMAGES ? (
                  <span className="text-gray-500">Límite máximo alcanzado ({LIMITS.MAX_IMAGES}/{LIMITS.MAX_IMAGES})</span>
                ) : (
                  <>
                    <span className="text-gray-300 font-negro">
                      Haz clic para subir
                    </span>{" "}
                    o arrastra y suelta
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF, WEBP. Máximo 5MB por imagen.
              </p>
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleFileChange}
              disabled={imagePreviews.length >= LIMITS.MAX_IMAGES}
              className="hidden"
            />
          </div>
        </div>

        <div className="pt-4 space-y-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-200 text-md font-negro">
              Variantes del Producto (Color, Talle, Imagen, etc.)
              <span className="ml-2 text-xs text-gray-400">
                ({normalizedVariants.length}/{LIMITS.MAX_VARIANTS} variantes)
              </span>
            </h3>
            <div className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
              💡 El campo "Valor" se completa automáticamente al escribir la "Etiqueta"
            </div>
          </div>
          {normalizedVariants &&
            normalizedVariants.map((variant, vIdx) => (
              <div
                key={vIdx}
                className="p-3 mb-2 border border-gray-700 bg-gray-800/50"
              >
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block mb-1 text-xs text-gray-400 font-negro">
                      Nombre de la Variante
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(vIdx, "name", e.target.value)
                      }
                      placeholder="Ej: Color, Talle, Estampado"
                      className="bg-[#23272f] text-white border border-gray-700 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 rounded-lg px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-400 font-negro">
                      Tipo
                    </label>
                    <select
                      value={variant.type || "talle"}
                      onChange={(e) =>
                        handleVariantChange(vIdx, "type", e.target.value)
                      }
                      className="bg-[#23272f] text-white border border-gray-700 rounded-lg px-3 py-2"
                    >
                      <option value="talle">Talle</option>
                      <option value="color">Color</option>
                      <option value="imagen">Imagen</option>
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeVariant(vIdx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {/* Opciones de la variante */}
                <div className="mt-4 space-y-2">
                  {Array.isArray(variant.options) &&
                    variant.options.map((option, oIdx) => (
                      <div
                        key={oIdx}
                        className="flex flex-wrap items-center gap-2 p-2 border border-gray-700 rounded-lg bg-gray-900/60"
                      >
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1">Etiqueta</label>
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                vIdx,
                                oIdx,
                                "label",
                                e.target.value
                              )
                            }
                            placeholder="Ej: Rojo, Talla S, etc."
                            className="bg-[#23272f] text-white border border-gray-700 rounded-lg px-2 py-1 w-28"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1">Valor</label>
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                vIdx,
                                oIdx,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Se completa automáticamente"
                            className="bg-[#23272f] text-white border border-gray-700 rounded-lg px-2 py-1 w-24"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1">Stock</label>
                          <input
                            type="number"
                            value={option.stock || 0}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                vIdx,
                                oIdx,
                                "stock",
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="Stock"
                            min="0"
                            className="bg-[#23272f] text-white border border-gray-700 rounded-lg px-2 py-1 w-20"
                            title={`Stock disponible para ${option.label || 'esta opción'}`}
                          />
                        </div>
                        {/* Si es color, mostrar color picker */}
                        {variant.type === "color" && (
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-400 mb-1">Color</label>
                            <input
                              type="color"
                              value={option.hex || "#000000"}
                              onChange={(e) =>
                                handleVariantOptionChange(
                                  vIdx,
                                  oIdx,
                                  "hex",
                                  e.target.value
                                )
                              }
                              className="w-8 h-8 border-none rounded"
                            />
                          </div>
                        )}
                        {/* Si es imagen, input para subir imagen */}
                        {variant.type === "imagen" && (
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-400 mb-1">Imagen</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleVariantOptionImage(
                                    vIdx,
                                    oIdx,
                                    e.target.files[0]
                                  )
                                }
                                className="text-xs"
                              />
                              {option.image && (
                                <img
                                  src={option.image}
                                  alt="preview"
                                  className="object-cover w-10 h-10 rounded"
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {/* Forma y tamaño */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1">Forma</label>
                          <select
                            value={option.shape || "circle"}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                vIdx,
                                oIdx,
                                "shape",
                                e.target.value
                              )
                            }
                            className="bg-[#23272f] text-white border border-gray-700 rounded-lg px-2 py-1"
                          >
                            <option value="circle">Circular</option>
                            <option value="square">Cuadrada</option>
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-400 mb-1">Tamaño</label>
                          <select
                            value={option.size || "md"}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                vIdx,
                                oIdx,
                                "size",
                                e.target.value
                              )
                            }
                            className="bg-[#23272f] text-white border border-gray-700 rounded-lg px-2 py-1"
                          >
                            <option value="sm">Chica</option>
                            <option value="md">Mediana</option>
                            <option value="lg">Grande</option>
                          </select>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeVariantOption(vIdx, oIdx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  <Button
                    type="button"
                    onClick={() => addVariantOption(vIdx)}
                    disabled={variant.options.length >= LIMITS.MAX_OPTIONS_PER_VARIANT}
                    className={`flex items-center gap-2 px-2 py-1 mt-2 text-xs text-white transition-colors border border-gray-700 ${
                      variant.options.length >= LIMITS.MAX_OPTIONS_PER_VARIANT
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-black hover:bg-white hover:text-black hover:border-black'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir Opción ({variant.options.length}/{LIMITS.MAX_OPTIONS_PER_VARIANT})
                  </Button>
                </div>
              </div>
            ))}
          <Button
            type="button"
            onClick={addVariant}
            disabled={normalizedVariants.length >= LIMITS.MAX_VARIANTS}
            className={`flex items-center gap-2 px-4 py-2 mt-2 text-sm text-white transition-colors border border-gray-700 ${
              normalizedVariants.length >= LIMITS.MAX_VARIANTS 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-black hover:bg-white hover:text-black hover:border-black'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Variante
          </Button>
          
          {/* Resumen de stock de variantes */}
          {normalizedVariants.length > 0 && (
            <VariantStockSummary 
              variants={normalizedVariants} 
              className="mt-4 bg-gray-800/30 border-gray-600" 
            />
          )}
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visible"
              name="visible"
              checked={safeFormData.visible}
              onChange={handleInputChange}
              className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 focus:ring-indigo-600"
            />
            <label
              htmlFor="visible"
              className="text-sm text-gray-300 font-negro"
            >
              Visible en tienda
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_trending"
              name="is_trending"
              checked={safeFormData.is_trending}
              onChange={handleInputChange}
              className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-600"
            />
            <label
              htmlFor="is_trending"
              className="flex items-center text-sm text-gray-300 font-negro"
            >
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              Producto Tendencia
            </label>
          </div>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button
            type="submit"
            className="w-full text-white bg-blue-600 hover:bg-blue-700"
          >
            {safeEditingProduct.id ? "Actualizar" : "Crear"} Producto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="w-full text-white bg-black border-gray-500 font-negro hover:bg-gray-700 sm:w-auto"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;
