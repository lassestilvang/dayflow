import { DayColumn } from "./DayColumn";

interface CalendarGridProps {
  weekStart: Date;
}

export function CalendarGrid({ weekStart }: CalendarGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  return (
    <div className="overflow-x-auto h-full scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      <div className="grid grid-cols-7 gap-1 md:gap-2 min-w-max h-full px-2 md:px-0">
        {days.map((day, index) => (
          <DayColumn key={day.toISOString()} date={day} />
        ))}
      </div>
    </div>
  );
}
