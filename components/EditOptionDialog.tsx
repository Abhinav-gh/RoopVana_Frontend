
import React, { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming you have a basic Button component
import { motion, AnimatePresence } from 'framer-motion';

interface EditOptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  defaultValue: string;
  currentValue: string;
  onSave: (newValue: string) => void;
  onReset: () => void;
}

export const EditOptionDialog: React.FC<EditOptionDialogProps> = ({
  isOpen,
  onClose,
  title,
  defaultValue,
  currentValue,
  onSave,
  onReset,
}) => {
  const [value, setValue] = useState(currentValue);

  // Update local state when prop changes
  useEffect(() => {
    setValue(currentValue);
  }, [currentValue, isOpen]);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const handleReset = () => {
    setValue(defaultValue);
    onReset();
    // Check if we should auto-close or let user click save. 
    // Usually reset just updates the value in the input, user still needs to confirm.
    // But the prompt implied "reset button to restore default properties".
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">Edit {title}</h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Prompt Description</label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full min-h-[120px] p-3 text-sm bg-muted/30 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
                  placeholder="Enter custom prompt description..."
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                <span>Default:</span>
                <span className="italic truncate max-w-[200px]">{defaultValue}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground gap-2"
                title="Reset to default prompt"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="default" size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
