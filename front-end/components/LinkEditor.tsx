// components/LinkEditor.tsx
import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AddLinkDialog } from './AddLinkDialog';
import { SortableLinkItem } from './SortableLinkItem';
import { Link } from '@/types';

interface LinkEditorProps {
  links: Link[];
  sensors: any;
  onDragEnd: any;
  isAddDialogOpen: boolean;
  onAddDialogChange: (open: boolean) => void;
  newLink: Omit<Link, 'id'>;
  onNewLinkChange: (link: Omit<Link, 'id'>) => void;
  onAddLink: (e: React.FormEvent) => Promise<void> | void;
  onUpdateLink: (id: string, field: 'title' | 'url', value: string) => void;
  onDeleteLink: () => void;
}

export function LinkEditor({
  links,
  sensors,
  onDragEnd,
  isAddDialogOpen,
  onAddDialogChange,
  newLink,
  onNewLinkChange,
  onAddLink,
  onUpdateLink,
  onDeleteLink
}: LinkEditorProps) {
  return (
    <div className="flex-1 space-y-6">
      <AddLinkDialog
        isOpen={isAddDialogOpen}
        onOpenChange={onAddDialogChange}
        newLink={newLink}
        onNewLinkChange={onNewLinkChange}
        onSubmit={onAddLink}
      />

      {/* DRAG AND DROP CONTEXT */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={links.map(link => link.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {links.map((link) => (
              <SortableLinkItem
                key={link.id}
                link={link}
                onUpdate={onUpdateLink}
                onDelete={onDeleteLink}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}