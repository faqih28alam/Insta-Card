// hooks/useDragAndDrop.ts
import { useEffect, useState } from "react";
import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Link } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface UseDragAndDropProps {
  initialLinks: Link[];
  onReorder?: (links: Link[]) => void;
}

export function useDragAndDrop({
  initialLinks,
  onReorder,
}: UseDragAndDropProps) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const supabase = createClient();

  useEffect(() => {
    const getLinks = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error?.message);
        return;
      }

      const { data: linksData } = await supabase
        .from("links")
        .select("id, title, url")
        .eq("user_id", user.id);

      if (linksData) {
        setLinks(linksData);
      }
    };

    getLinks();
  }, [supabase]);

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
