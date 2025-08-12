import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Tag, Check, X as IconX, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Acepta tanto los props nuevos como los antiguos (retrocompatibilidad)
const CategoryManagement = ({
  categories = [],
  handleCreateCategory,
  handleSaveCategory,
  handleDeleteCategory,
  onCreate, // alias
  onSave,   // alias
  onDelete  // alias
}) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImageFile, setNewCategoryImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');

  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const newImageInputRef = useRef(null);
  const editImageInputRef = useRef(null);

  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const createFn = handleCreateCategory || onCreate;
  const saveFn = handleSaveCategory || onSave;
  const deleteFn = handleDeleteCategory || onDelete;

  const onEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setImagePreview(category.image || '');
    setCategoryImageFile(null);
  };

  const handleSaveInternal = async (id) => {
    if (!saveFn) {
      toast({ title: 'Error', description: 'No se definió función para guardar.', variant: 'destructive' });
      return;
    }
    if (!categoryName.trim()) {
      toast({ title: 'Error', description: 'El nombre no puede estar vacío.', variant: 'destructive' });
      return;
    }
    try {
      setSavingId(id);
      const ok = await saveFn(id, categoryName, categoryImageFile, editingCategory?.image);
      if (ok !== false) { // treat undefined as success
        onCancelEdit();
      }
    } finally {
      setSavingId(null);
    }
  };

  const onCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryImageFile(null);
    setImagePreview('');
  };

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFn) {
      toast({ title: 'Error', description: 'No se definió función para crear.', variant: 'destructive' });
      return;
    }
    const name = newCategoryName.trim();
    if (!name) {
      toast({ title: 'Error', description: 'El nombre no puede estar vacío.', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      const ok = await createFn(name, newCategoryImageFile);
      if (ok !== false) {
        setNewCategoryName('');
        setNewCategoryImageFile(null);
        setNewImagePreview('');
        if (newImageInputRef.current) newImageInputRef.current.value = '';
      }
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteFn || !categoryToDelete) return;
    try {
      setDeletingId(categoryToDelete.id);
      const ok = await deleteFn(categoryToDelete.id);
      if (ok !== false) {
        setCategoryToDelete(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileChange = (e, isNew) => {
    const file = e.target.files[0];
    if (file) {
      if (isNew) {
        setNewCategoryImageFile(file);
        setNewImagePreview(URL.createObjectURL(file));
      } else {
        setCategoryImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-gray-900 border border-gray-700 shadow-sm lg:col-span-1"
    >
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white mb-4">Gestión de Categorías</h2>
      </div>
      <div className="p-6 space-y-4">
        <form onSubmit={onCreateSubmit} className="p-4 space-y-3 border border-gray-700 bg-gray-800/50">
          <h3 className="text-white font-negro">Nueva Categoría</h3>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
            placeholder="NOMBRE DE CATEGORÍA"
            className="w-full px-3 py-2 text-sm text-white placeholder-gray-400 bg-[#23272f] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="icon" className="border-gray-600 bg-[#23272f] hover:bg-black group" onClick={() => newImageInputRef.current?.click()}>
              <ImageIcon className="w-4 h-4 text-black group-hover:text-white transition-colors" />
            </Button>
            <input type="file" ref={newImageInputRef} onChange={(e) => handleFileChange(e, true)} className="hidden" accept="image/*" />
            {newImagePreview && <img src={newImagePreview} alt="preview" className="object-cover w-10 h-10" />}
            <span className="text-xs text-gray-400">{newCategoryImageFile ? newCategoryImageFile.name : 'Subir imagen...'}</span>
          </div>
          <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">{creating ? 'Creando...' : 'Crear'}</span>
          </Button>
        </form>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="p-3 transition-colors bg-gray-800 hover:bg-gray-700/50">
              <AnimatePresence>
              {editingCategory?.id === cat.id ? (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-3">
                  <input 
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value.toUpperCase())}
                    className="w-full px-2 py-1 text-sm text-white bg-[#23272f] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" size="icon" className="border-gray-600 bg-[#23272f] hover:bg-black group" onClick={() => editImageInputRef.current?.click()}>
                      <ImageIcon className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                    </Button>
                    <input type="file" ref={editImageInputRef} onChange={(e) => handleFileChange(e, false)} className="hidden" accept="image/*" />
                    {imagePreview && <img src={imagePreview} alt="preview" className="object-cover w-10 h-10" />}
                    <span className="text-xs text-gray-400 truncate">{categoryImageFile ? categoryImageFile.name : 'Cambiar imagen...'}</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" disabled={savingId === cat.id} onClick={() => handleSaveInternal(cat.id)} className="text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed">
                      {savingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" disabled={savingId === cat.id} onClick={onCancelEdit} className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed">
                      <IconX className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center overflow-hidden">
                    {cat.image ? <img src={cat.image} alt={cat.name} className="object-cover w-8 h-8 mr-3"/> : <Tag className="flex-shrink-0 w-5 h-5 mr-2 text-gray-400" />}
                    <span className="text-sm text-white truncate">{cat.name}</span>
                  </div>
                  <div className="flex flex-shrink-0">
                    <Button variant="ghost" size="icon" disabled={deletingId === cat.id} onClick={() => onEdit(cat)} className="text-blue-400 hover:text-blue-300 disabled:opacity-50">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={deletingId === cat.id} onClick={() => setCategoryToDelete(cat)} className="text-red-400 hover:text-red-300 disabled:opacity-50">
                      {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría
              "{categoryToDelete?.name}". No podrás eliminarla si tiene productos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default CategoryManagement;
