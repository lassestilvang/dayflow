import { EventCard } from "./EventCard";
import { useDragDrop } from "@/hooks/useDragDrop";
import { useEvents } from "@/lib/api";
import type { Event } from "@/lib/api";

interface TimeSlotProps {
  hour: number;
  date: Date;
}

export function TimeSlot({ hour, date }: TimeSlotProps) {
  const { data: events } = useEvents();
  const { handleDrop, isDragging } = useDragDrop();

  // Filter events for this specific hour and date
  const slotEvents = events?.filter((event: Event) => {
    const eventDate = new Date(event.start_time);
    const eventHour = eventDate.getHours();
    const eventDay = eventDate.toDateString();
    const slotDay = date.toDateString();
    return eventHour === hour && eventDay === slotDay;
  }) || [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    handleDrop(date, hour, events || []);
  };

  return (
    <div
      className={`h-12 border border-border rounded p-1 relative ${
        isDragging ? "bg-blue-50 border-blue-300" : ""
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDropEvent}
    >
      <div className="text-xs text-muted-foreground">
        {hour.toString().padStart(2, "0")}:00
      </div>
      {slotEvents.map((event: Event) => (
        <EventCard
          key={event.id}
          title={event.title}
          startTime={event.start_time}
          endTime={event.end_time}
          collaborators={event.collaborations?.map(c => c.user)}
        />
      ))}
    </div>
  );
}
