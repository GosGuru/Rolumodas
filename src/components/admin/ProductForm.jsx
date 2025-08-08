import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Star, Plus, Trash2 } from "lucide-react";
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
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...files],
      }));
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
      newVariants[variantIndex].options[optionIndex] = { label: "", value: "" };
    }
    newVariants[variantIndex].options[optionIndex][field] = value;
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
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
    const type = newVariants[variantIndex].type;
    const newOption = { label: "", value: "", shape: "circle", size: "md" };
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
              className="flex flex-col items-center justify-center w-full px-6 pt-5 pb-6 transition-colors bg-gray-800 border-2 border-gray-600 border-dashed cursor-pointer hover:border-black hover:bg-black group"
            >
              <UploadCloud className="w-12 h-12 mb-2 text-black transition-colors group-hover:text-white" />
              <p className="text-sm text-gray-400">
                <span className="text-gray-300 font-negro">
                  Haz clic para subir
                </span>{" "}
                o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF. Puedes seleccionar varias.
              </p>
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="pt-4 space-y-4 border-t border-gray-700">
          <h3 className="text-gray-200 text-md font-negro">
            Variantes del Producto (Color, Talle, Imagen, etc.)
          </h3>
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
                          placeholder="Etiqueta (ej: Rojo, S, Estampado)"
                          className="bg-[#23272f] text-white border border-gray-700 rounded-lg px-2 py-1 w-28"
                        />
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
                          placeholder="Valor (ej: rojo, s, estampado)"
                          className="bg-[#23272f] text-white border border-gray-700 rounded-lg px-2 py-1 w-24"
                        />
                        {/* Si es color, mostrar color picker */}
                        {variant.type === "color" && (
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
                            className="w-8 h-8 border-none"
                          />
                        )}
                        {/* Si es imagen, input para subir imagen */}
                        {variant.type === "imagen" && (
                          <>
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
                          </>
                        )}
                        {/* Forma y tamaño */}
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
                    className="flex items-center gap-2 px-2 py-1 mt-2 text-xs text-white transition-colors bg-black border border-gray-700 hover:bg-white hover:text-black hover:border-black"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir Opción
                  </Button>
                </div>
              </div>
            ))}
          <Button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 px-4 py-2 mt-2 text-sm text-white transition-colors bg-black border border-gray-700 hover:bg-white hover:text-black hover:border-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Variante
          </Button>
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
