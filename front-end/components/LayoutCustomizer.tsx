// components/LayoutCustomizer.tsx
"use client";

import React, { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    User,
    Type,
    AtSign,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link2,
    FileText,
    Eye,
    EyeOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlockType = "avatar" | "display_name" | "public_link" | "bio" | "links";
export type AlignType = "left" | "center" | "right";

export interface LayoutBlock {
    id: BlockType;
    label: string;
    visible: boolean;
    align: AlignType;
}

export const DEFAULT_LAYOUT_BLOCKS: LayoutBlock[] = [
    { id: "avatar", label: "Avatar", visible: true, align: "center" },
    { id: "display_name", label: "Display Name", visible: true, align: "center" },
    { id: "public_link", label: "Username", visible: true, align: "center" },
    { id: "bio", label: "Bio", visible: true, align: "center" },
    { id: "links", label: "Links", visible: true, align: "center" },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const ICONS: Record<BlockType, React.ReactNode> = {
    avatar: <User className="w-3.5 h-3.5" />,
    display_name: <Type className="w-3.5 h-3.5" />,
    public_link: <AtSign className="w-3.5 h-3.5" />,
    bio: <FileText className="w-3.5 h-3.5" />,
    links: <Link2 className="w-3.5 h-3.5" />,
};

const ACCENT: Record<BlockType, { pill: string; icon: string }> = {
    avatar: { pill: "bg-violet-50 text-violet-600 border-violet-100", icon: "bg-violet-100 text-violet-500" },
    display_name: { pill: "bg-blue-50   text-blue-600   border-blue-100", icon: "bg-blue-100   text-blue-500" },
    public_link: { pill: "bg-indigo-50 text-indigo-600 border-indigo-100", icon: "bg-indigo-100 text-indigo-500" },
    bio: { pill: "bg-sky-50    text-sky-600     border-sky-100", icon: "bg-sky-100    text-sky-500" },
    links: { pill: "bg-purple-50 text-purple-600  border-purple-100", icon: "bg-purple-100 text-purple-500" },
};

const ALIGN_CYCLE: AlignType[] = ["left", "center", "right"];

const AlignIcon = ({ align }: { align: AlignType }) => {
    if (align === "left") return <AlignLeft className="w-3.5 h-3.5" />;
    if (align === "right") return <AlignRight className="w-3.5 h-3.5" />;
    return <AlignCenter className="w-3.5 h-3.5" />;
};

// ─── Sortable Row ─────────────────────────────────────────────────────────────

interface RowProps {
    block: LayoutBlock;
    index: number;
    isGhost: boolean;
    onToggleVisible: (id: BlockType) => void;
    onCycleAlign: (id: BlockType) => void;
}

function SortableRow({ block, index, isGhost, onToggleVisible, onCycleAlign }: RowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isSorting } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 200ms cubic-bezier(0.25,0.46,0.45,0.94)",
        opacity: isGhost ? 0 : 1,
    };

    const accent = ACCENT[block.id];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all duration-150 ${block.visible
                ? "bg-white border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300"
                : "bg-slate-50/70 border-dashed border-slate-200 opacity-60"
                } ${isSorting ? "shadow-lg scale-[1.01]" : ""}`}
        >
            <span className="w-5 text-[11px] font-semibold text-slate-300 text-center select-none tabular-nums">
                {index + 1}
            </span>
            <button {...attributes} {...listeners} className="text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing touch-none transition-colors flex-shrink-0" tabIndex={-1}>
                <GripVertical className="w-4 h-4" />
            </button>
            <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border tracking-wide uppercase ${accent.pill}`}>
                <span className={`w-5 h-5 rounded-md flex items-center justify-center ${accent.icon}`}>
                    {ICONS[block.id]}
                </span>
                {block.label}
            </span>
            <div className="flex-1" />
            {block.id !== "avatar" && block.id !== "links" && (
                <button onClick={() => onCycleAlign(block.id)} disabled={!block.visible} title={`Align: ${block.align}`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:pointer-events-none">
                    <AlignIcon align={block.align} />
                </button>
            )}
            <button onClick={() => onToggleVisible(block.id)} title={block.visible ? "Hide block" : "Show block"}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${block.visible ? "text-slate-300 hover:text-slate-600 hover:bg-slate-100" : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                    }`}>
                {block.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface LayoutCustomizerProps {
    blocks: LayoutBlock[];
    onChange: (blocks: LayoutBlock[]) => void;
}

export function LayoutCustomizer({ blocks, onChange }: LayoutCustomizerProps) {
    const [activeId, setActiveId] = useState<BlockType | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as BlockType);

    const handleDragEnd = (e: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = e;
        if (over && active.id !== over.id) {
            const from = blocks.findIndex((b) => b.id === active.id);
            const to = blocks.findIndex((b) => b.id === over.id);
            onChange(arrayMove(blocks, from, to));
        }
    };

    const toggleVisible = (id: BlockType) =>
        onChange(blocks.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)));

    const cycleAlign = (id: BlockType) =>
        onChange(
            blocks.map((b) => {
                if (b.id !== id) return b;
                const next = ALIGN_CYCLE[(ALIGN_CYCLE.indexOf(b.align) + 1) % ALIGN_CYCLE.length];
                return { ...b, align: next };
            })
        );

    const activeBlock = blocks.find((b) => b.id === activeId);

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                    {blocks.map((block, i) => (
                        <SortableRow key={block.id} block={block} index={i} isGhost={activeId === block.id} onToggleVisible={toggleVisible} onCycleAlign={cycleAlign} />
                    ))}
                </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
                {activeBlock && (
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 border-2 border-[#6366F1] bg-white shadow-2xl ring-4 ring-[#6366F1]/10">
                        <span className="w-5 text-[11px] font-semibold text-slate-300 text-center tabular-nums">
                            {blocks.findIndex((b) => b.id === activeBlock.id) + 1}
                        </span>
                        <GripVertical className="w-4 h-4 text-[#6366F1]" />
                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border tracking-wide uppercase ${ACCENT[activeBlock.id].pill}`}>
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center ${ACCENT[activeBlock.id].icon}`}>
                                {ICONS[activeBlock.id]}
                            </span>
                            {activeBlock.label}
                        </span>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}