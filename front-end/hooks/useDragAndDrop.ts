// hooks/useDragAndDrop.ts

import { useCallback } from "react";
import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Link } from "@/types";

interface UseDragAndDropProps {
  links: Link[];
  setLinks: (links: Link[] | ((prev: Link[]) => Link[])) => void;
  onReorder?: (links: Link[]) => void;
}

export function useDragAndDrop({
  links,
  setLinks,
  onReorder,
}: UseDragAndDropProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setLinks((prevLinks) => {
        const oldIndex = prevLinks.findIndex((l) => l.id === active.id);
        const newIndex = prevLinks.findIndex((l) => l.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prevLinks;

        const newLinks = arrayMove(prevLinks, oldIndex, newIndex);
        onReorder?.(newLinks);
        return newLinks;
      });
    },
    [setLinks, onReorder]
  );

  return { links, setLinks, sensors, handleDragEnd };
}
