import { Button } from "@/components/ui/button";
import { Calendar, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/appStore";

export function Header() {
  const { currentWeek, navigateWeek, isWeekLoading } = useAppStore();

  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const month = weekStart.toLocaleDateString("en-US", { month: "long" });
    const startDay = weekStart.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    const endDay = weekEnd.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

    return `${month} – ${startDay} → ${endDay}`;
  };

  return (
    <header className="h-16 border-b bg-background px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Calendar className="h-6 w-6" />
          <h1 className="text-lg md:text-xl font-semibold hidden sm:block">DayFlow</h1>
        </div>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('prev')}
            title="Previous week"
            disabled={isWeekLoading}
            className="p-1 md:p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs md:text-sm font-medium min-w-0 truncate max-w-32 md:max-w-none">
            {isWeekLoading ? 'Loading...' : formatWeekRange(currentWeek)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('next')}
            title="Next week"
            disabled={isWeekLoading}
            className="p-1 md:p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="sm" className="p-1 md:p-2">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
