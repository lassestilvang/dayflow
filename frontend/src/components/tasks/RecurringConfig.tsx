import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Repeat, X } from "lucide-react";

interface RecurringConfigProps {
  rrule?: string;
  onRruleChange: (rrule: string | undefined) => void;
}

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY";
type Weekday = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export function RecurringConfig({
  rrule,
  onRruleChange,
}: RecurringConfigProps) {
  const [frequency, setFrequency] = useState<Frequency>("WEEKLY");
  const [interval, setInterval] = useState(1);
  const [weekdays, setWeekdays] = useState<Weekday[]>(["MO"]);

  const parseRrule = (rruleStr?: string) => {
    if (!rruleStr) return;

    // Simple parsing for our RRULE format
    const freqMatch = rruleStr.match(/FREQ=(\w+)/);
    if (freqMatch) {
      setFrequency(freqMatch[1] as Frequency);
    }

    const intervalMatch = rruleStr.match(/INTERVAL=(\d+)/);
    if (intervalMatch) {
      setInterval(parseInt(intervalMatch[1]));
    }

    const byDayMatch = rruleStr.match(/BYDAY=([A-Z,]+)/);
    if (byDayMatch) {
      setWeekdays(byDayMatch[1].split(",") as Weekday[]);
    }
  };

  // Initialize from existing rrule
  useState(() => {
    if (rrule) {
      parseRrule(rrule);
    }
  });

  const generateRrule = (): string => {
    let rruleStr = `FREQ=${frequency}`;

    if (interval > 1) {
      rruleStr += `;INTERVAL=${interval}`;
    }

    if (frequency === "WEEKLY" && weekdays.length > 0) {
      rruleStr += `;BYDAY=${weekdays.join(",")}`;
    }

    return rruleStr;
  };

  const handleApply = () => {
    const newRrule = generateRrule();
    onRruleChange(newRrule);
  };

  const handleClear = () => {
    setFrequency("WEEKLY");
    setInterval(1);
    setWeekdays(["MO"]);
    onRruleChange(undefined);
  };

  const toggleWeekday = (day: Weekday) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const weekdayOptions: { value: Weekday; label: string }[] = [
    { value: "MO", label: "Mon" },
    { value: "TU", label: "Tue" },
    { value: "WE", label: "Wed" },
    { value: "TH", label: "Thu" },
    { value: "FR", label: "Fri" },
    { value: "SA", label: "Sat" },
    { value: "SU", label: "Sun" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="w-5 h-5" />
          Recurring Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="frequency" className="text-sm font-medium">
              Frequency
            </label>
            <Select
              value={frequency}
              onValueChange={(value: Frequency) => setFrequency(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="interval" className="text-sm font-medium">
              Every
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="interval"
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">
                {frequency === "DAILY" && `day${interval > 1 ? "s" : ""}`}
                {frequency === "WEEKLY" && `week${interval > 1 ? "s" : ""}`}
                {frequency === "MONTHLY" && `month${interval > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>

        {frequency === "WEEKLY" && (
          <div>
            <label className="text-sm font-medium">Repeat on</label>
            <div className="flex gap-2 mt-2">
              {weekdayOptions.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={weekdays.includes(value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleWeekday(value)}
                  className="w-12"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleApply} className="flex-1">
            Apply Recurrence
          </Button>
          <Button onClick={handleClear} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {rrule && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            RRULE: {rrule}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
