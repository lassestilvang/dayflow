import { AppDataSource } from "../data-source";
import { Event } from "../entities/Event";
import { User } from "../entities/User";

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface SchedulingSuggestion {
  suggestedTime: TimeSlot;
  reason: string;
  confidence: number; // 0-1
}

export class SchedulingService {
  private static eventRepository = AppDataSource.getRepository(Event);

  static async findAvailableSlots(
    user: User,
    preferredTime: TimeSlot,
    durationMinutes: number = 60,
    daysToCheck: number = 7
  ): Promise<SchedulingSuggestion[]> {
    const suggestions: SchedulingSuggestion[] = [];

    // Get existing events for the next week
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysToCheck);

    const existingEvents = await this.eventRepository
      .createQueryBuilder("event")
      .where("event.userId = :userId", { userId: user.id })
      .andWhere("event.start_time >= :startDate", { startDate })
      .andWhere("event.end_time <= :endDate", { endDate })
      .orderBy("event.start_time", "ASC")
      .getMany();

    // Check if preferred time is available
    const isPreferredAvailable = !this.hasConflict(
      preferredTime,
      existingEvents
    );
    if (isPreferredAvailable) {
      suggestions.push({
        suggestedTime: preferredTime,
        reason: "Preferred time is available",
        confidence: 1.0,
      });
    }

    // Generate alternative suggestions
    const alternatives = this.generateAlternatives(
      preferredTime,
      existingEvents,
      durationMinutes,
      daysToCheck
    );
    suggestions.push(...alternatives);

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  static async checkConflicts(
    user: User,
    proposedTime: TimeSlot
  ): Promise<{ hasConflict: boolean; conflictingEvents: Event[] }> {
    const conflictingEvents = await this.eventRepository
      .createQueryBuilder("event")
      .where("event.userId = :userId", { userId: user.id })
      .andWhere("event.start_time < :endTime", { endTime: proposedTime.end })
      .andWhere("event.end_time > :startTime", {
        startTime: proposedTime.start,
      })
      .getMany();

    return {
      hasConflict: conflictingEvents.length > 0,
      conflictingEvents,
    };
  }

  private static hasConflict(
    proposedTime: TimeSlot,
    existingEvents: Event[]
  ): boolean {
    return existingEvents.some(
      (event) =>
        event.start_time < proposedTime.end &&
        event.end_time > proposedTime.start
    );
  }

  private static generateAlternatives(
    preferredTime: TimeSlot,
    existingEvents: Event[],
    durationMinutes: number,
    daysToCheck: number
  ): SchedulingSuggestion[] {
    const suggestions: SchedulingSuggestion[] = [];
    const durationMs = durationMinutes * 60 * 1000;

    // Try times around the preferred time (earlier/later same day)
    const sameDaySuggestions = this.findSlotsOnDay(
      preferredTime.start,
      existingEvents,
      durationMs,
      3 // 3 hours before/after
    );

    sameDaySuggestions.forEach((slot) => {
      suggestions.push({
        suggestedTime: slot,
        reason: "Alternative time on the same day",
        confidence: 0.8,
      });
    });

    // Try next day at similar time
    const nextDay = new Date(preferredTime.start);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(
      preferredTime.start.getHours(),
      preferredTime.start.getMinutes(),
      0,
      0
    );

    const nextDaySlot: TimeSlot = {
      start: nextDay,
      end: new Date(nextDay.getTime() + durationMs),
    };

    if (!this.hasConflict(nextDaySlot, existingEvents)) {
      suggestions.push({
        suggestedTime: nextDaySlot,
        reason: "Same time tomorrow",
        confidence: 0.7,
      });
    }

    // Try common business hours on upcoming days
    for (let dayOffset = 1; dayOffset <= daysToCheck; dayOffset++) {
      const day = new Date(preferredTime.start);
      day.setDate(day.getDate() + dayOffset);

      // Try 9 AM, 10 AM, 2 PM, 3 PM
      const commonHours = [9, 10, 14, 15];
      for (const hour of commonHours) {
        const slotStart = new Date(day);
        slotStart.setHours(hour, 0, 0, 0);
        const slot: TimeSlot = {
          start: slotStart,
          end: new Date(slotStart.getTime() + durationMs),
        };

        if (!this.hasConflict(slot, existingEvents)) {
          suggestions.push({
            suggestedTime: slot,
            reason: `Available at ${hour}:00 on ${day.toLocaleDateString()}`,
            confidence: 0.6 - dayOffset * 0.05, // Slightly lower confidence for later days
          });
        }
      }
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  private static findSlotsOnDay(
    targetDate: Date,
    existingEvents: Event[],
    durationMs: number,
    hoursRange: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Filter events for this day
    const dayEvents = existingEvents.filter(
      (event) => event.start_time >= dayStart && event.start_time <= dayEnd
    );

    // Try slots around the target time
    const targetHour = targetDate.getHours();
    for (let hourOffset = -hoursRange; hourOffset <= hoursRange; hourOffset++) {
      if (hourOffset === 0) continue; // Skip the original time

      const slotStart = new Date(targetDate);
      slotStart.setHours(
        targetHour + hourOffset,
        targetDate.getMinutes(),
        0,
        0
      );
      const slotEnd = new Date(slotStart.getTime() + durationMs);

      // Check if slot is within reasonable hours (8 AM - 8 PM)
      if (slotStart.getHours() < 8 || slotEnd.getHours() > 20) continue;

      const slot: TimeSlot = { start: slotStart, end: slotEnd };
      if (!this.hasConflict(slot, dayEvents)) {
        slots.push(slot);
      }
    }

    return slots;
  }
}
