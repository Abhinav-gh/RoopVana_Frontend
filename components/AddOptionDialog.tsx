import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddOptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string; // e.g., "Upper Garment", "Fabric"
  withColor?: boolean;
  onSave: (data: { label: string; prompt: string; hex?: string }) => void;
}

export function AddOptionDialog({
  open,
  onOpenChange,
  categoryName,
  withColor = false,
  onSave,
}: AddOptionDialogProps) {
  const [label, setLabel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [hex, setHex] = useState("#000000");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setLabel("");
      setPrompt("");
      setHex("#000000");
    }
  }, [open]);

  const handleSave = () => {
    if (!label.trim()) return;
    
    // Construct data object
    const data: { label: string; prompt: string; hex?: string } = {
      label: label.trim(),
      prompt: prompt.trim() || label.trim(), // Fallback to label if prompt is empty
    };

    if (withColor) {
      data.hex = hex;
    }

    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New {categoryName}</DialogTitle>
          <DialogDescription>
            Add a custom {categoryName.toLowerCase()} to your selection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`e.g. My Custom ${categoryName}`}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prompt" className="text-right">
              Prompt
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe it for the AI..."
              className="col-span-3"
            />
          </div>
          {withColor && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!label.trim()}>
            Save Option
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
