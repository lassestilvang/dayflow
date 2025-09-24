import { CalendarView } from "@/components/calendar/CalendarView";
import { TaskList } from "@/components/tasks/TaskList";
import { CalendarSettings } from "@/components/settings/CalendarSettings";
import { useAppStore } from "@/store/appStore";

export function MainPanel() {
  const { currentView } = useAppStore();

  return (
    <main className="flex-1 flex overflow-hidden">
      <div className="flex-1">
        {currentView === "calendar" && <CalendarView />}
        {currentView === "settings" && <CalendarSettings />}
      </div>
      <div className="w-80 border-l bg-background">
        <TaskList />
      </div>
    </main>
  );
}
