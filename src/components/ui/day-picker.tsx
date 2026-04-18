import React from 'react';
import { cn } from '@/lib/utils';

interface DayPickerProps {
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  className?: string;
}

export const DayPicker: React.FC<DayPickerProps> = ({
  selectedDay,
  onSelectDay,
  className
}) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay(day)}
            className={cn(
              "h-10 w-10 rounded-lg text-sm font-medium transition-all",
              "hover:bg-primary/10 hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              selectedDay === day
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {day}
          </button>
        ))}
      </div>
      {selectedDay && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Selected day: <span className="font-semibold text-foreground">{selectedDay}</span>
          </p>
        </div>
      )}
    </div>
  );
};
