
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Pencil } from 'lucide-react';
import { DropdownOption } from './CustomDropdown';

interface OptionItemProps {
  itemKey: string;
  option: DropdownOption;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: (key: string, option: DropdownOption) => void;
}

export const OptionItem: React.FC<OptionItemProps> = ({ itemKey, option, isSelected, onSelect, onEdit }) => (
  <div
    className={cn(
      "group relative flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md cursor-pointer select-none outline-none hover:bg-accent hover:text-accent-foreground",
      isSelected && "bg-accent/50 text-accent-foreground"
    )}
    onClick={onSelect}
  >
    <div className="flex items-center gap-2 truncate flex-1">
      {option.icon && <span className="text-base shrink-0">{option.icon}</span>}
      <span className="truncate">{option.label}</span>
    </div>
    
    <div className="flex items-center gap-1">
      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
      
      {/* Edit Button - Prevent propagation to avoid selecting the item when editing */}
      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(itemKey, option);
          }}
          className="p-1 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background hover:text-primary transition-all"
          title="Edit prompt"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);
