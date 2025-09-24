import { CalendarGrid } from "./CalendarGrid";
import { useAppStore } from "@/store/appStore";

export function CalendarView() {
  const { currentWeek } = useAppStore();

  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Calendar</h2>
      </div>
      <CalendarGrid weekStart={currentWeek} />
    </div>
  );
}
