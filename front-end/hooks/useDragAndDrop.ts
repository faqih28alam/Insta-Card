// hooks/useDragAndDrop.ts
import { useState } from 'react';
import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Link } from '@/types';

interface UseDragAndDropProps {
  onReorder?: (links: Link[]) => void;
}

export function useDragAndDrop({ onReorder }: UseDragAndDropProps) {
  // ✅ No initialLinks at all — page.tsx controls links via setLinks directly
  const [links, setLinks] = useState<Link[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      if (onReorder) {
        onReorder(newLinks);
      }
    }
  };

  return {
    links,
    setLinks,
    sensors,
    handleDragEnd,
  };
}