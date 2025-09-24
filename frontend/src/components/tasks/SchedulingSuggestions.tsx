import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchedulingSuggestions } from "@/lib/api";
import { Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import type { SchedulingSuggestion } from "@/lib/api";

interface SchedulingSuggestionsProps {
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  onSelectSuggestion?: (suggestion: SchedulingSuggestion) => void;
}

export function SchedulingSuggestions({
  startTime,
  endTime,
  durationMinutes = 60,
  onSelectSuggestion,
}: SchedulingSuggestionsProps) {
  const suggestionsMutation = useSchedulingSuggestions();

  const handleGetSuggestions = () => {
    suggestionsMutation.mutate({
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Smart Scheduling Suggestions
          </div>
          <Button
            onClick={handleGetSuggestions}
            disabled={suggestionsMutation.isPending}
            size="sm"
          >
            {suggestionsMutation.isPending ? "Loading..." : "Get Suggestions"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestionsMutation.data && suggestionsMutation.data.length > 0 ? (
          <div className="space-y-3">
            {suggestionsMutation.data.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          {formatDate(suggestion.suggestedTime.start)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatTime(suggestion.suggestedTime.start)} -{" "}
                          {formatTime(suggestion.suggestedTime.end)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(
                            suggestion.confidence
                          )}`}
                        >
                          {Math.round(suggestion.confidence * 100)}% match
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {suggestion.reason}
                      </p>
                    </div>
                    {onSelectSuggestion && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectSuggestion(suggestion)}
                        className="ml-4"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Use This
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : suggestionsMutation.isError ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Failed to get suggestions. Please try again.
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>
              Click "Get Suggestions" to find optimal times for your task or
              event.
            </p>
            <p className="text-sm mt-2">
              We'll check your calendar for conflicts and suggest the best
              available slots.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
