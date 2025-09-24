import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckSquare,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Inbox,
  AlertTriangle,
  User,
} from "lucide-react";
import { useState } from "react";
import { useTasks, useCategories, useCollaborations } from "@/lib/api";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { data: tasks } = useTasks();
  const { data: categories } = useCategories();
  const { data: collaborations } = useCollaborations();
  const { setCurrentView } = useAppStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["tasks"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Calculate task counts
  const overdueTasks =
    tasks?.filter(
      (task) =>
        task.due_date &&
        new Date(task.due_date) < new Date() &&
        task.status !== "completed"
    ) || [];

  const inboxTasks = tasks?.filter((task) => !task.category) || [];

  const categoryTasks = (categoryId: number) =>
    tasks?.filter((task) => task.category?.id === categoryId) || [];

  const defaultCategories = [
    { id: "inbox", name: "Inbox", icon: Inbox, tasks: inboxTasks },
    {
      id: "overdue",
      name: "Overdue",
      icon: AlertTriangle,
      tasks: overdueTasks,
    },
  ];

  return (
    <aside className="w-64 border-r bg-background p-4">
      <nav className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setCurrentView("calendar")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Calendar
        </Button>

        {/* Tasks Section */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => toggleSection("tasks")}
          >
            <div className="flex items-center">
              <CheckSquare className="mr-2 h-4 w-4" />
              Tasks
            </div>
            {expandedSections.has("tasks") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {expandedSections.has("tasks") && (
            <div className="ml-4 mt-2 space-y-1">
              {/* Default categories */}
              {defaultCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-between text-sm",
                    category.id === "overdue" &&
                      category.tasks.length > 0 &&
                      "text-red-600"
                  )}
                >
                  <div className="flex items-center">
                    <category.icon className="mr-2 h-3 w-3" />
                    {category.name}
                  </div>
                  {category.tasks.length > 0 && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        category.id === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {category.tasks.length}
                    </span>
                  )}
                </Button>
              ))}

              {/* User categories */}
              {categories?.map((category) => {
                const categoryTaskCount = categoryTasks(category.id).length;
                return (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className="w-full justify-between text-sm"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded mr-2 border"
                        style={{ backgroundColor: category.color || "#ccc" }}
                      />
                      {category.name}
                    </div>
                    {categoryTaskCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                        {categoryTaskCount}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Collaborations Section */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => toggleSection("collaborations")}
          >
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Collaborators
            </div>
            {expandedSections.has("collaborations") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {expandedSections.has("collaborations") && (
            <div className="ml-4 mt-2 space-y-1">
              {collaborations?.map((collab) => (
                <Button
                  key={collab.id}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  <div className="flex items-center">
                    <User className="mr-2 h-3 w-3" />
                    {collab.user.name}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setCurrentView("settings")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>
    </aside>
  );
}
