import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, Check, X as IconX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
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

const CategoryManager = ({ categories, createCategory, updateCategory, deleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleCreateCategory = (e) => {
    e.preventDefault();
    const name = newCategoryName.trim().toUpperCase();
    if (!name) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" });
      return;
    }
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    createCategory(name, slug);
    setNewCategoryName('');
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  const handleSaveCategory = (id) => {
    if (!categoryName.trim()) {
      toast({ title: "Error", description: "El nombre de la categoría no puede estar vacío.", variant: "destructive" });
      return;
    }
    updateCategory(id, categoryName.trim().toUpperCase());
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    deleteCategory(categoryToDelete.id);
    setCategoryToDelete(null);
  };

  return (
    <>
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
          <form onSubmit={handleCreateCategory} className="flex space-x-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
              placeholder="NUEVA CATEGORÍA"
              className="flex-grow px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white text-sm"
            />
            <Button type="submit" size="icon" className="bg-white text-black hover:bg-gray-300">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700/50 transition-colors">
                {editingCategory?.id === cat.id ? (
                  <>
                    <Tag className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <input 
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value.toUpperCase())}
                      className="flex-grow px-2 py-1 border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-white text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSaveCategory(cat.id)} className="text-green-400 hover:text-green-300 ml-2">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleCancelEditCategory} className="text-red-400 hover:text-red-300">
                      <IconX className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center overflow-hidden">
                      <Tag className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-white truncate">{cat.name}</span>
                    </div>
                    <div className="flex flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(cat)} className="text-blue-400 hover:text-blue-300">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setCategoryToDelete(cat)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
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
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryManager;