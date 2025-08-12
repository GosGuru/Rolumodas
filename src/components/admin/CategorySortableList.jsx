import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, DragOverlay, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const SortableItem = ({ id, name, image, dragHandle="row" }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // While dragging we lift the element visually
    boxShadow: isDragging ? '0 4px 16px -2px rgba(0,0,0,0.35)' : undefined,
    zIndex: isDragging ? 50 : undefined
  };
  // Decide where to spread listeners (entire row vs icon)
  const handleProps = dragHandle === 'row' ? { ...attributes, ...listeners } : {};
  const iconHandleProps = dragHandle !== 'row' ? { ...attributes, ...listeners } : {};
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...handleProps}
      className={`flex items-center justify-between px-3 py-2 bg-gray-800 rounded border border-gray-700 gap-3 select-none touch-none cursor-grab active:cursor-grabbing transition-colors ${isDragging ? 'opacity-80 ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          {image && <img src={image} alt={name} className="w-8 h-8 object-cover rounded" />}
          <span className="text-sm text-white truncate">{name}</span>
        </div>
      </div>
      {dragHandle !== 'row' && (
        <button aria-label="arrastrar" {...iconHandleProps} className="p-1 text-gray-400 hover:text-white">
          <GripVertical className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const CategorySortableList = ({ categories = [], onReorder, dragHandle = 'row' }) => {
  const [items, setItems] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 50, tolerance: 5 } })
  );

  useEffect(() => {
    // Ordenar localmente por sort_order y fallback al nombre
    const ordered = [...categories]
      .sort((a,b) => {
        if (a.sort_order == null && b.sort_order == null) return a.name.localeCompare(b.name);
        if (a.sort_order == null) return 1;
        if (b.sort_order == null) return -1;
        return a.sort_order - b.sort_order;
      })
      .map(c => ({ id: c.id, name: c.name, image: c.image }));
    setItems(ordered);
    setDirty(false);
  }, [categories]);

  const restoreScroll = () => {
    document.body.style.overflow = '';
    document.documentElement.style.overscrollBehavior = '';
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    // Disable body scroll while dragging on touch devices for better control
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems(prev => {
        const oldIndex = prev.findIndex(i => i.id === active.id);
        const newIndex = prev.findIndex(i => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setDirty(true);
    }
    setActiveId(null);
    restoreScroll();
  };

  const handleDragCancel = () => {
    setActiveId(null);
    restoreScroll();
  };

  const handleSaveOrder = async () => {
    if (!dirty) {
      toast({ title: 'Sin cambios', description: 'No hay un nuevo orden para guardar.' });
      return;
    }
    if (onReorder) {
      await onReorder(items.map(i => i.id));
      setDirty(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 border border-gray-700 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Ordenar Categorías</h3>
        <Button size="sm" onClick={handleSaveOrder} disabled={!dirty} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40">Guardar orden</Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map(item => (
              <SortableItem key={item.id} id={item.id} name={item.name} image={item.image} dragHandle={dragHandle} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className="px-3 py-2 bg-blue-600/90 text-white rounded shadow-lg flex items-center gap-2">
              <GripVertical className="w-4 h-4 opacity-70" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {items.find(i => i.id === activeId)?.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {dirty && <p className="text-xs text-yellow-400">Tienes cambios sin guardar.</p>}
    </div>
  );
};

export default CategorySortableList;
