import { TimeSlot } from "./TimeSlot";

interface DayColumnProps {
  date: Date;
}

export function DayColumn({ date }: DayColumnProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="border rounded-lg p-1 md:p-2 min-w-16 md:min-w-20">
      <div className="text-center mb-1 md:mb-2 font-medium text-xs md:text-sm">
        {date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </div>
      <div className="space-y-0.5 md:space-y-1">
        {hours.map((hour) => (
          <TimeSlot key={hour} hour={hour} date={date} />
        ))}
      </div>
    </div>
  );
}
