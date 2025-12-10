import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, getBlockColor, type Block } from "@shared/schema";

interface MergeAllPickerProps {
  grid: (Block | null)[][];
  selectedValue: number | null;
  onSelectValue: (value: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MergeAllPicker({
  grid,
  selectedValue,
  onSelectValue,
  onConfirm,
  onCancel
}: MergeAllPickerProps) {
  const valueCounts: Record<number, number> = {};
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < (grid[row]?.length || 0); col++) {
      const block = grid[row]?.[col];
      if (block) {
        valueCounts[block.value] = (valueCounts[block.value] || 0) + 1;
      }
    }
  }
  
  const mergeableValues = Object.entries(valueCounts)
    .filter(([, count]) => count >= 2)
    .map(([value]) => parseInt(value))
    .sort((a, b) => a - b);

  if (mergeableValues.length === 0) {
    return (
      <div className="absolute inset-x-4 bottom-24 bg-game-grid/95 rounded-2xl p-4 shadow-xl border border-white/10" data-testid="merge-picker">
        <div className="text-center text-white/80 font-game mb-4">
          No blocks can be merged
        </div>
        <Button onClick={onCancel} variant="outline" className="w-full">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-4 bottom-24 bg-game-grid/95 rounded-2xl p-4 shadow-xl border border-white/10" data-testid="merge-picker">
      <div className="text-center text-white font-game-display text-lg mb-3">
        Select number to merge
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {mergeableValues.map((value) => {
          const count = valueCounts[value];
          const isSelected = selectedValue === value;
          const color = getBlockColor(value);
          
          return (
            <button
              key={value}
              onClick={() => onSelectValue(value)}
              className={`relative w-14 h-14 rounded-xl flex items-center justify-center font-game-display font-bold text-white transition-all ${
                isSelected ? "ring-4 ring-yellow-400 scale-110" : ""
              }`}
              style={{ backgroundColor: color }}
              data-testid={`merge-option-${value}`}
            >
              <span className="text-lg">{formatNumber(value)}</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full text-xs font-bold text-gray-900 flex items-center justify-center">
                {count}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={onCancel} 
          variant="outline" 
          className="flex-1"
          data-testid="merge-cancel"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          disabled={!selectedValue}
          className="flex-1 bg-blue-500 hover:bg-blue-600"
          data-testid="merge-confirm"
        >
          <Check className="w-4 h-4 mr-1" />
          Merge
        </Button>
      </div>
    </div>
  );
}
