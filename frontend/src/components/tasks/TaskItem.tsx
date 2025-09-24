import { motion } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDragDrop } from "@/hooks/useDragDrop";
import type { Task, Subtask } from "@/lib/api";

interface TaskItemProps {
  task: Task;
  onUpdate?: (updates: Partial<Task>) => void;
}

export function TaskItem({ task, onUpdate }: TaskItemProps) {
  const [newSubtask, setNewSubtask] = useState("");
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const { handleDragStart, handleDragEnd } = useDragDrop();

  const handleToggleComplete = () => {
    onUpdate?.({
      status: task.status === "completed" ? "pending" : "completed",
    });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: Subtask = {
        id: Date.now(), // Temporary ID
        title: newSubtask.trim(),
        completed: false,
        task_id: task.id,
      };
      onUpdate?.({
        subtasks: [...(task.subtasks || []), subtask],
      });
      setNewSubtask("");
      setShowAddSubtask(false);
    }
  };

  const handleToggleSubtask = (subtaskId: number) => {
    const updatedSubtasks = task.subtasks?.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate?.({ subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: number) => {
    const updatedSubtasks = task.subtasks?.filter((st) => st.id !== subtaskId);
    onUpdate?.({ subtasks: updatedSubtasks });
  };

  const completedSubtasks =
    task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <motion.div
      className="p-3 border rounded-lg bg-background cursor-move"
      whileHover={{ scale: 1.01 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={() => handleDragStart(task)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleComplete}
          className={`w-5 h-5 border-2 rounded flex-shrink-0 mt-0.5 ${
            task.status === "completed"
              ? "bg-primary border-primary"
              : "border-muted-foreground"
          }`}
        >
          {task.status === "completed" && (
            <Check className="w-3 h-3 text-primary-foreground" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-medium ${
                task.status === "completed"
                  ? "line-through text-muted-foreground"
                  : ""
              }`}
            >
              {task.title}
            </h3>
            {totalSubtasks > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {task.description}
            </p>
          )}

          {task.due_date && (
            <p className="text-xs text-muted-foreground mb-2">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </p>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-1 mb-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <button
                    onClick={() => handleToggleSubtask(subtask.id)}
                    className={`w-3 h-3 border rounded flex-shrink-0 ${
                      subtask.completed
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {subtask.completed && (
                      <Check className="w-2 h-2 text-primary-foreground" />
                    )}
                  </button>
                  <span
                    className={
                      subtask.completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add subtask */}
          {showAddSubtask ? (
            <div className="flex gap-2 mt-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                className="text-sm h-7"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubtask();
                  if (e.key === "Escape") setShowAddSubtask(false);
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleAddSubtask} className="h-7 px-2">
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddSubtask(false)}
                className="h-7 px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddSubtask(true)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add subtask
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
