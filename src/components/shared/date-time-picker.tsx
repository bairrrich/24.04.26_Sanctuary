'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSettingsStore } from '@/store/settings-store';

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  showTime?: boolean;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  showTime = false,
  placeholder = 'Выберите дату',
}: DateTimePickerProps) {
  const [timeValue, setTimeValue] = useState('12:00');
  const language = useSettingsStore((s) => s.language);
  const locale = language === 'ru' ? ru : enUS;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (showTime) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      date.setHours(hours || 0, minutes || 0);
    }
    onChange(date);
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    if (value) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours || 0, minutes || 0);
      onChange(newDate);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 justify-start text-left font-normal text-sm"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'dd MMM yyyy', { locale }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {showTime && (
        <div className="relative">
          <Clock className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-2.5 pl-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
    </div>
  );
}
