// components/AddLinkDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Link } from '@/types';

interface AddLinkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newLink: Omit<Link, 'id'>;
  onNewLinkChange: (link: Omit<Link, 'id'>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
}

export function AddLinkDialog({ 
  isOpen, 
  onOpenChange, 
  newLink, 
  onNewLinkChange,
  onSubmit 
}: AddLinkDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full py-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-md text-lg font-semibold">
          <Plus className="mr-2 h-5 w-5" /> Add New Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Link</DialogTitle>
            <DialogDescription>
              Add a new link to your profile
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-title">Title</Label>
              <Input
                id="link-title"
                placeholder="Instagram"
                value={newLink.title}
                onChange={(e) =>
                  onNewLinkChange({ ...newLink, title: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://instagram.com/username"
                value={newLink.url}
                onChange={(e) =>
                  onNewLinkChange({ ...newLink, url: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-[#6366F1] hover:bg-[#4F46E5]"
            >
              Add Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
