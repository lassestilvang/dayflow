import { useState } from "react";
import type { Task, Event } from "@/lib/api";

export function useDragDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (task: Task) => {
    setIsDragging(true);
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedTask(null);
  };

  const handleDrop = (date: Date, hour: number, events: Event[] = []) => {
    if (!draggedTask) return;

    // Convert task to event
    const eventStart = new Date(date);
    eventStart.setHours(hour, 0, 0, 0);

    const eventEnd = new Date(eventStart);
    eventEnd.setHours(hour + 1, 0, 0, 0); // Default 1 hour duration

    // Check for conflicts
    const hasConflict = events.some((event) => {
      const eventStartTime = new Date(event.start_time);
      const eventEndTime = new Date(event.end_time);
      return (
        (eventStart >= eventStartTime && eventStart < eventEndTime) ||
        (eventEnd > eventStartTime && eventEnd <= eventEndTime) ||
        (eventStart <= eventStartTime && eventEnd >= eventEndTime)
      );
    });

    if (hasConflict) {
      alert("Cannot schedule event: Time slot is already occupied!");
      setIsDragging(false);
      setDraggedTask(null);
      return;
    }

    // Here you would call an API to create the event
    // For now, just log it
    console.log("Converting task to event:", {
      task: draggedTask,
      start: eventStart,
      end: eventEnd,
    });

    setIsDragging(false);
    setDraggedTask(null);
  };

  return {
    isDragging,
    draggedTask,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };
}
