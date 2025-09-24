import { TaskItem } from "./TaskItem";
import { TaskFilters } from "./TaskFilters";
import { NLPInput } from "./NLPInput";
import { SchedulingSuggestions } from "./SchedulingSuggestions";
import { useTasks, useUpdateTask } from "@/lib/api";
import type { Task } from "@/lib/api";

export function TaskList() {
  const { data: tasks, isLoading, error } = useTasks();
  const updateTaskMutation = useUpdateTask();

  const handleUpdateTask = (id: number, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ id, ...updates });
  };

  if (isLoading) return <div className="p-4">Loading tasks...</div>;
  if (error) return <div className="p-4">Error loading tasks</div>;

  return (
    <div className="p-4 space-y-4">
      <NLPInput />
      <SchedulingSuggestions
        startTime={new Date().toISOString()}
        endTime={new Date(Date.now() + 60 * 60 * 1000).toISOString()}
      />
      <div>
        <h3 className="text-lg font-semibold mb-4">Tasks</h3>
        <TaskFilters />
        <div className="space-y-3 mt-4">
          {tasks?.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={(updates) => handleUpdateTask(task.id, updates)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
