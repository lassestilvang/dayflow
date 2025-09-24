import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  useCalendarIntegrations,
  useInitiateCalendarAuth,
  useDisconnectCalendar,
  useSyncCalendars,
} from "../../lib/api";
import { TaskImportSettings } from "./TaskImportSettings";
import { Loader2, Calendar, Trash2, RefreshCw } from "lucide-react";

const PROVIDERS = [
  { id: "google", name: "Google Calendar", icon: "📅" },
  { id: "outlook", name: "Outlook Calendar", icon: "📧" },
  { id: "apple", name: "Apple Calendar", icon: "🍎" },
  { id: "fastmail", name: "Fastmail Calendar", icon: "✉️" },
];

export function CalendarSettings() {
  const { data: integrations, isLoading } = useCalendarIntegrations();
  const initiateAuth = useInitiateCalendarAuth();
  const disconnect = useDisconnectCalendar();
  const sync = useSyncCalendars();
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async (provider: string) => {
    try {
      // For OAuth providers, redirect to backend
      window.location.href = `http://localhost:3000/api/calendars/initiate/${provider}`;
    } catch (error) {
      console.error("Failed to initiate auth:", error);
    }
  };

  const handleDisconnect = async (integrationId: number) => {
    try {
      await disconnect.mutateAsync(integrationId);
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await sync.mutateAsync();
    } catch (error) {
      console.error("Failed to sync:", error);
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = (provider: string) => {
    return integrations?.some(
      (integration) => integration.provider === provider
    );
  };

  const getIntegration = (provider: string) => {
    return integrations?.find(
      (integration) => integration.provider === provider
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">
            Manage your integrations and preferences.
          </p>
        </div>
      </div>

      <TaskImportSettings />

      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Calendar Integrations</h3>
            <p className="text-muted-foreground">
              Connect your external calendars to sync events into your planner.
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing || !integrations?.length}
            variant="outline"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Calendars
          </Button>
        </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const connected = isConnected(provider.id);
          const integration = getIntegration(provider.id);

          return (
            <Card key={provider.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{provider.icon}</span>
                  {provider.name}
                </CardTitle>
                <CardDescription>
                  {connected
                    ? `Connected on ${new Date(
                        integration!.created_at
                      ).toLocaleDateString()}`
                    : `Connect your ${provider.name} to sync events`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connected ? (
                  <Button
                    variant="destructive"
                    onClick={() => handleDisconnect(integration!.id)}
                    disabled={disconnect.isPending}
                  >
                    {disconnect.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(provider.id)}
                    disabled={initiateAuth.isPending}
                  >
                    {initiateAuth.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {integrations && integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Calendars</CardTitle>
            <CardDescription>
              Your events from these calendars will be automatically synced.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {integrations.map((integration) => {
                const provider = PROVIDERS.find(
                  (p) => p.id === integration.provider
                );
                return (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{provider?.icon}</span>
                      <span className="font-medium">{provider?.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Connected{" "}
                      {new Date(integration.created_at).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
