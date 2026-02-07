// hooks/useDragAndDrop.ts
import { useState } from "react";
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
  initialLinks: Link[];
  onReorder?: (links: Link[]) => void;
}

export function useDragAndDrop({
  initialLinks,
  onReorder,
}: UseDragAndDropProps) {
  const [links, setLinks] = useState<Link[]>(initialLinks);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      // Call optional callback for backend sync
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
