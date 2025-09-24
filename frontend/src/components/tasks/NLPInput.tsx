import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParseNLP, useCreateFromNLP } from "@/lib/api";
import type { ParsedTask } from "@/lib/api";
import { Loader2, Sparkles, Calendar, CheckCircle } from "lucide-react";

export function NLPInput() {
  const [input, setInput] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedTask | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const parseMutation = useParseNLP();
  const createMutation = useCreateFromNLP();

  const handleParse = async () => {
    if (!input.trim()) return;

    try {
      const result = await parseMutation.mutateAsync(input);
      setParsedResult(result);
      setShowPreview(true);
    } catch (error) {
      console.error("Failed to parse input:", error);
    }
  };

  const handleCreate = async () => {
    if (!input.trim()) return;

    try {
      await createMutation.mutateAsync(input);
      setInput("");
      setParsedResult(null);
      setShowPreview(false);
    } catch (error) {
      console.error("Failed to create task/event:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (showPreview) {
        handleCreate();
      } else {
        handleParse();
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Natural Language Task Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Try: 'Lunch with Sarah at 1 PM tomorrow' or 'Weekly team meeting every Monday at 10 AM'"
            className="flex-1"
          />
          <Button
            onClick={showPreview ? handleCreate : handleParse}
            disabled={
              !input.trim() ||
              parseMutation.isPending ||
              createMutation.isPending
            }
          >
            {parseMutation.isPending || createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : showPreview ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Parse
              </>
            )}
          </Button>
        </div>

        {showPreview && parsedResult && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {parsedResult.isEvent ? (
                  <Calendar className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Preview: {parsedResult.isEvent ? "Event" : "Task"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Title:</strong> {parsedResult.title}
              </div>
              {parsedResult.description && (
                <div>
                  <strong>Description:</strong> {parsedResult.description}
                </div>
              )}
              {parsedResult.due_date && (
                <div>
                  <strong>Due Date:</strong>{" "}
                  {new Date(parsedResult.due_date).toLocaleDateString()}
                </div>
              )}
              {parsedResult.start_time && parsedResult.end_time && (
                <div>
                  <strong>Time:</strong>{" "}
                  {new Date(parsedResult.start_time).toLocaleTimeString()} -{" "}
                  {new Date(parsedResult.end_time).toLocaleTimeString()}
                </div>
              )}
              {parsedResult.location && (
                <div>
                  <strong>Location:</strong> {parsedResult.location}
                </div>
              )}
              {parsedResult.priority && (
                <div>
                  <strong>Priority:</strong> {parsedResult.priority}
                </div>
              )}
              {parsedResult.rrule && (
                <div>
                  <strong>Recurrence:</strong> {parsedResult.rrule}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground">
          Examples: "Buy groceries tomorrow", "Team meeting at 3 PM", "Call
          dentist next Monday", "Weekly review every Friday", "Doctor
          appointment at 2 PM in downtown"
        </div>
      </CardContent>
    </Card>
  );
}
