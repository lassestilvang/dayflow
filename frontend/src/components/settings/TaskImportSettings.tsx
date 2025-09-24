import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTaskImports,
  useCreateTaskImport,
  useDeleteTaskImport,
  useImportTasks,
  useImportHistory,
} from "@/lib/api";
import type { TaskImport, ImportHistory } from "@/lib/api";
import { Trash2, Download, History } from "lucide-react";

const PROVIDERS = [
  {
    value: "notion",
    label: "Notion",
    description: "Import tasks from Notion databases",
  },
  {
    value: "clickup",
    label: "ClickUp",
    description: "Import tasks from ClickUp workspaces",
  },
  {
    value: "linear",
    label: "Linear",
    description: "Import issues from Linear projects",
  },
  {
    value: "todoist",
    label: "Todoist",
    description: "Import tasks from Todoist projects",
  },
];

export function TaskImportSettings() {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [credentials, setCredentials] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);

  const { data: taskImports, isLoading } = useTaskImports();
  const { data: importHistory } = useImportHistory();
  const createMutation = useCreateTaskImport();
  const deleteMutation = useDeleteTaskImport();
  const importMutation = useImportTasks();

  const handleConnect = async () => {
    if (!selectedProvider || !credentials) return;

    try {
      await createMutation.mutateAsync({
        provider: selectedProvider as
          | "notion"
          | "clickup"
          | "linear"
          | "todoist",
        credentials,
      });
      setCredentials("");
      setSelectedProvider("");
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const handleImport = async (importId: number) => {
    try {
      await importMutation.mutateAsync(importId);
    } catch (error) {
      console.error("Failed to import:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect Task Services</CardTitle>
          <CardDescription>
            Connect your task management services to import tasks into your
            planner.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={selectedProvider}
              onValueChange={setSelectedProvider}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="password"
              placeholder="API Key / Token"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
            />
          </div>
          <Button
            onClick={handleConnect}
            disabled={
              !selectedProvider || !credentials || createMutation.isPending
            }
          >
            {createMutation.isPending ? "Connecting..." : "Connect Service"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Services</CardTitle>
          <CardDescription>
            Manage your connected task services and import tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {taskImports && taskImports.length > 0 ? (
            <div className="space-y-4">
              {taskImports.map((taskImport: TaskImport) => (
                <div
                  key={taskImport.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium capitalize">
                      {taskImport.provider}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Connected on{" "}
                      {new Date(taskImport.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleImport(taskImport.id)}
                      disabled={importMutation.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDisconnect(taskImport.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No services connected yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View your recent task import activities.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? "Hide" : "Show"} History
            </Button>
          </div>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {importHistory && importHistory.length > 0 ? (
              <div className="space-y-2">
                {importHistory.map((history: ImportHistory) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <span className="font-medium capitalize">
                        {history.provider}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(history.imported_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">
                        {history.tasks_imported} imported,{" "}
                        {history.tasks_skipped} skipped
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          history.status === "success"
                            ? "bg-green-100 text-green-800"
                            : history.status === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {history.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No import history yet.</p>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
