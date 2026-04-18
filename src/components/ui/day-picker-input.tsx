import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DayPickerInputProps {
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  className?: string;
}

export const DayPickerInput: React.FC<DayPickerInputProps> = ({
  selectedDay,
  onSelectDay,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDaySelect = (day: number) => {
    onSelectDay(day);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input",
          "bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className={selectedDay ? "text-foreground" : "text-muted-foreground"}>
          {selectedDay ? `Day ${selectedDay}` : "Select day"}
        </span>
        <Calendar className="h-4 w-4 opacity-50" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover p-4 shadow-md">
          <div className="mb-2 text-sm font-medium text-foreground">Select Day of Month</div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDaySelect(day)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-all",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  selectedDay === day
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-background"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
