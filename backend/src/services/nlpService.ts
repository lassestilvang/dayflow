import { TaskPriority } from "../entities/Task";

export interface ParsedTask {
  title: string;
  description?: string;
  due_date?: Date;
  priority?: TaskPriority;
  isEvent?: boolean;
  start_time?: Date;
  end_time?: Date;
  location?: string;
  rrule?: string;
}

export class NLPService {
  private static readonly TIME_PATTERNS = [
    // "at 1 PM", "at 13:00", "at 1pm"
    /\b(at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\b/g,
    // "tomorrow at 1 PM"
    /\b(tomorrow|today|next week|next month)\s+(at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\b/g,
  ];

  private static readonly DATE_PATTERNS = [
    // "tomorrow", "today", "next week", "next month"
    /\b(tomorrow|today|next week|next month|next monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    // "on Monday", "this Monday"
    /\b(on|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    // "in 2 days", "in 1 week"
    /\bin\s+(\d+)\s+(days?|weeks?|months?)\b/gi,
  ];

  private static readonly RECURRENCE_PATTERNS = [
    // "every day", "daily"
    /\b(every day|daily|everyday)\b/gi,
    // "every week", "weekly"
    /\b(every week|weekly)\b/gi,
    // "every month", "monthly"
    /\b(every month|monthly)\b/gi,
    // "every Monday", "Mondays"
    /\b(every\s+|on\s+)?(mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?)\b/gi,
  ];

  private static readonly LOCATION_PATTERNS = [
    // "at [location]", "in [location]"
    /\b(at|in)\s+([A-Za-z\s]+?)(?:\s+(at|tomorrow|today|every|next)|\s*$)/gi,
  ];

  private static readonly PRIORITY_PATTERNS = [
    // "urgent", "important", "high priority"
    /\b(urgent|important|high priority|asap)\b/gi,
    // "low priority", "whenever"
    /\b(low priority|whenever|when possible)\b/gi,
  ];

  static parseTask(input: string): ParsedTask {
    const result: ParsedTask = {
      title: input.trim(),
    };

    // Extract time information
    const timeMatch = this.extractTime(input);
    if (timeMatch) {
      if (timeMatch.isEvent) {
        result.isEvent = true;
        result.start_time = timeMatch.startTime;
        result.end_time = timeMatch.endTime;
      } else {
        result.due_date = timeMatch.dueDate;
      }
    }

    // Extract recurrence
    const recurrence = this.extractRecurrence(input);
    if (recurrence) {
      result.rrule = recurrence;
    }

    // Extract location
    const location = this.extractLocation(input);
    if (location) {
      result.location = location;
      result.isEvent = true; // If location is specified, it's likely an event
    }

    // Extract priority
    const priority = this.extractPriority(input);
    if (priority) {
      result.priority = priority;
    }

    // Clean up title by removing parsed elements
    result.title = this.cleanTitle(input, result);

    return result;
  }

  private static extractTime(input: string): {
    startTime?: Date;
    endTime?: Date;
    dueDate?: Date;
    isEvent: boolean;
  } | null {
    const now = new Date();
    let hasTime = false;
    let date: Date | null = null;
    let startTime: Date | null = null;
    let endTime: Date | null = null;

    // Check for date keywords
    const dateMatch =
      input.match(this.DATE_PATTERNS[0]) ||
      input.match(this.DATE_PATTERNS[1]) ||
      input.match(this.DATE_PATTERNS[2]);
    if (dateMatch) {
      date = this.parseDate(dateMatch[0], now);
      hasTime = true;
    }

    // Check for time patterns
    const timeMatches = [
      ...input.matchAll(this.TIME_PATTERNS[0]),
      ...input.matchAll(this.TIME_PATTERNS[1]),
    ];
    if (timeMatches.length > 0) {
      hasTime = true;
      const firstTime = timeMatches[0];
      const hour = parseInt(firstTime[2]);
      const minute = firstTime[3] ? parseInt(firstTime[3]) : 0;
      const ampm = firstTime[4]?.toLowerCase();

      let hour24 = hour;
      if (ampm === "pm" && hour !== 12) hour24 += 12;
      if (ampm === "am" && hour === 12) hour24 = 0;

      if (date) {
        startTime = new Date(date);
        startTime.setHours(hour24, minute, 0, 0);
        // Assume 1 hour duration for events
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);
      } else {
        // Today or tomorrow
        const baseDate = date || now;
        startTime = new Date(baseDate);
        startTime.setHours(hour24, minute, 0, 0);
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);
      }
    }

    if (!hasTime) return null;

    return {
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      dueDate: startTime || date || undefined,
      isEvent: !!startTime,
    };
  }

  private static parseDate(dateStr: string, now: Date): Date {
    const date = new Date(now);

    switch (dateStr.toLowerCase()) {
      case "tomorrow":
        date.setDate(date.getDate() + 1);
        break;
      case "today":
        break;
      case "next week":
        date.setDate(date.getDate() + 7);
        break;
      case "next month":
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        // Handle "next monday" etc.
        if (dateStr.startsWith("next ")) {
          const dayName = dateStr.replace("next ", "").toLowerCase();
          const targetDay = this.getDayOfWeek(dayName);
          if (targetDay !== null) {
            const currentDay = date.getDay();
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7;
            date.setDate(date.getDate() + daysToAdd);
          }
        }
        break;
    }

    return date;
  }

  private static getDayOfWeek(dayName: string): number | null {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days.indexOf(dayName);
  }

  private static extractRecurrence(input: string): string | null {
    const daily = input.match(this.RECURRENCE_PATTERNS[0]);
    if (daily) return "FREQ=DAILY";

    const weekly = input.match(this.RECURRENCE_PATTERNS[1]);
    if (weekly) return "FREQ=WEEKLY";

    const monthly = input.match(this.RECURRENCE_PATTERNS[2]);
    if (monthly) return "FREQ=MONTHLY";

    const weekday = input.match(this.RECURRENCE_PATTERNS[3]);
    if (weekday) {
      const dayName = weekday[0].replace(/^(every|on)\s+/i, "").toUpperCase();
      return `FREQ=WEEKLY;BYDAY=${dayName.substring(0, 2)}`;
    }

    return null;
  }

  private static extractLocation(input: string): string | null {
    const match = input.match(this.LOCATION_PATTERNS[0]);
    if (match) {
      return match[2].trim();
    }
    return null;
  }

  private static extractPriority(input: string): TaskPriority | null {
    const highPriority = input.match(this.PRIORITY_PATTERNS[0]);
    if (highPriority) return TaskPriority.HIGH;

    const lowPriority = input.match(this.PRIORITY_PATTERNS[1]);
    if (lowPriority) return TaskPriority.LOW;

    return null;
  }

  private static cleanTitle(input: string, parsed: ParsedTask): string {
    let title = input;

    // Remove time/date patterns
    this.TIME_PATTERNS.forEach((pattern) => {
      title = title.replace(pattern, "").trim();
    });
    this.DATE_PATTERNS.forEach((pattern) => {
      title = title.replace(pattern, "").trim();
    });

    // Remove recurrence patterns
    this.RECURRENCE_PATTERNS.forEach((pattern) => {
      title = title.replace(pattern, "").trim();
    });

    // Remove location patterns
    this.LOCATION_PATTERNS.forEach((pattern) => {
      title = title.replace(pattern, "").trim();
    });

    // Remove priority patterns
    this.PRIORITY_PATTERNS.forEach((pattern) => {
      title = title.replace(pattern, "").trim();
    });

    // Clean up extra spaces
    title = title.replace(/\s+/g, " ").trim();

    return title || "Untitled Task";
  }
}
