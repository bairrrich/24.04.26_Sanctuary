'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LAYOUT } from '@/lib/constants';

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onFilterClick?: () => void;
  filterCount?: number;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Поиск...',
  onFilterClick,
  filterCount,
}: SearchFilterProps) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ height: LAYOUT.SEARCH_FILTER_HEIGHT }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-full pl-9 text-sm"
        />
      </div>
      {onFilterClick && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFilterClick}
          className="relative shrink-0"
          style={{ height: LAYOUT.SEARCH_FILTER_HEIGHT, width: LAYOUT.SEARCH_FILTER_HEIGHT }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {filterCount !== undefined && filterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {filterCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
