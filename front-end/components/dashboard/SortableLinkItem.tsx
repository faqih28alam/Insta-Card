// components/SortableLinkItem.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2 } from 'lucide-react';
import { Link } from '@/types';

interface SortableLinkItemProps {
    link: Link;
    onUpdate: (id: string, field: 'title' | 'url', value: string) => void;
    onDelete: () => void;
}

export function SortableLinkItem({ link, onUpdate, onDelete }: SortableLinkItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="p-4 border-slate-200 shadow-sm bg-white group hover:border-[#6366F1] transition-all"
        >
            <div className="flex items-start gap-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-3 cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400 touch-none"
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <Input
                            value={link.title}
                            onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
                            className="h-7 font-bold text-[#0F172A] border-none p-0 focus-visible:ring-0 text-base"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            value={link.url}
                            onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
                            className="h-5 text-[#475569] border-none p-0 focus-visible:ring-0 text-sm italic"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}