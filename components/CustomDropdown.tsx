
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  label: string;
  icon?: string;
  prompt?: string;
}

interface CustomDropdownProps {
  value: string;
  options: [string, DropdownOption][]; // Array of [key, option]
  onChange: (value: string) => void;
  onEdit?: (key: string, option: DropdownOption) => void;
  onAdd?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  options,
  onChange,
  onEdit,
  onAdd,
  placeholder = "Select...",
  disabled = false,
  className,
  title
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(([key]) => key === value);

  const handleSelect = (key: string) => {
    onChange(key);
    setIsOpen(false);
  };

  return (
    <div 
      className={cn("relative min-w-[140px]", className)} 
      ref={containerRef}
      title={title}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg bg-muted/50 border border-border transition-colors",
          !disabled && "hover:bg-muted cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-primary/20 border-primary/50"
        )}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {selectedOption ? (
            <>
              {selectedOption[1].icon && <span className="text-base shrink-0">{selectedOption[1].icon}</span>}
              <span className="truncate">{selectedOption[1].label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full min-w-[200px] z-50 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
          <div className="p-1">
            {/* Placeholder option to clear selection */}
            <div
                className={cn(
                  "relative flex items-center w-full px-2 py-1.5 text-sm rounded-md cursor-pointer select-none outline-none hover:bg-accent hover:text-accent-foreground",
                  value === "" && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSelect("")}
              >
                <span className="flex-1 truncate text-muted-foreground">{placeholder}</span>
                {value === "" && <Check className="w-4 h-4 ml-2 shrink-0 opacity-50" />}
            </div>

            {options.map(([key, option]) => (
              <div
                key={key}
                className={cn(
                  "group relative flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md cursor-pointer select-none outline-none hover:bg-accent hover:text-accent-foreground",
                  value === key && "bg-accent/50 text-accent-foreground"
                )}
                onClick={() => handleSelect(key)}
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  {option.icon && <span className="text-base shrink-0">{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {value === key && <Check className="w-4 h-4 text-primary shrink-0" />}
                  
                  {/* Edit Button - Prevent propagation to avoid selecting the item when editing */}
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(key, option);
                        setIsOpen(false); 
                      }}
                      className="p-1 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background hover:text-primary transition-all"
                      title="Edit prompt"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Option */}
            {onAdd && (
              <>
                <div className="h-px bg-border my-1" />
                <button
                  type="button"
                  onClick={() => {
                    onAdd();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-primary rounded-md cursor-pointer select-none outline-none hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New...
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
