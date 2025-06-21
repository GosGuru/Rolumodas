
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
import { Plus, Edit, Trash2, Tag, Check, X as IconX, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const CategoryManagement = ({ categories, handleCreateCategory, handleSaveCategory, handleDeleteCategory }) => {
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

  const onEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setImagePreview(category.image || '');
    setCategoryImageFile(null);
  };

  const onSave = (id) => {
    handleSaveCategory(id, categoryName, categoryImageFile);
    onCancelEdit();
  };

  const onCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryImageFile(null);
    setImagePreview('');
  };

  const onCreate = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" });
      return;
    }
    handleCreateCategory(newCategoryName, newCategoryImageFile);
    setNewCategoryName('');
    setNewCategoryImageFile(null);
    setNewImagePreview('');
    if(newImageInputRef.current) newImageInputRef.current.value = '';
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      handleDeleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
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
      className="lg:col-span-1 bg-gray-900 shadow-sm border border-gray-700"
    >
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-negro">Gestión de Categorías</h2>
      </div>
      <div className="p-6 space-y-4">
        <form onSubmit={onCreate} className="space-y-3 p-4 border border-gray-700 bg-gray-800/50">
          <h3 className="font-negro text-white">Nueva Categoría</h3>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
            placeholder="NOMBRE DE CATEGORÍA"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white text-sm"
          />
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="icon" className="border-gray-600" onClick={() => newImageInputRef.current?.click()}>
              <ImageIcon className="h-4 w-4" />
            </Button>
            <input type="file" ref={newImageInputRef} onChange={(e) => handleFileChange(e, true)} className="hidden" accept="image/*" />
            {newImagePreview && <img src={newImagePreview} alt="preview" className="h-10 w-10 object-cover" />}
            <span className="text-xs text-gray-400">{newCategoryImageFile ? newCategoryImageFile.name : 'Subir imagen...'}</span>
          </div>
          <Button type="submit" className="w-full bg-white text-black hover:bg-gray-300">
            <Plus className="h-4 w-4 mr-2" />
            Crear
          </Button>
        </form>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="p-3 bg-gray-800 hover:bg-gray-700/50 transition-colors">
              <AnimatePresence>
              {editingCategory?.id === cat.id ? (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-3">
                  <input 
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value.toUpperCase())}
                    className="w-full px-2 py-1 border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-white text-sm"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" size="icon" className="border-gray-600" onClick={() => editImageInputRef.current?.click()}>
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <input type="file" ref={editImageInputRef} onChange={(e) => handleFileChange(e, false)} className="hidden" accept="image/*" />
                    {imagePreview && <img src={imagePreview} alt="preview" className="h-10 w-10 object-cover" />}
                    <span className="text-xs text-gray-400 truncate">{categoryImageFile ? categoryImageFile.name : 'Cambiar imagen...'}</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onSave(cat.id)} className="text-green-400 hover:text-green-300">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onCancelEdit} className="text-red-400 hover:text-red-300">
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center overflow-hidden">
                    {cat.image ? <img src={cat.image} alt={cat.name} className="h-8 w-8 object-cover mr-3"/> : <Tag className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />}
                    <span className="text-sm text-white truncate">{cat.name}</span>
                  </div>
                  <div className="flex flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(cat)} className="text-blue-400 hover:text-blue-300">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setCategoryToDelete(cat)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
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
