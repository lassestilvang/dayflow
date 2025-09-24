import axios from "axios";
import { CalendarIntegration } from "../entities/CalendarIntegration";
import { Event } from "../entities/Event";
import { AppDataSource } from "../data-source";

const eventRepository = AppDataSource.getRepository(Event);

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
}

export class CalendarService {
  static async ensureValidToken(
    integration: CalendarIntegration
  ): Promise<void> {
    if (!integration.expires_at || integration.expires_at < new Date()) {
      await this.refreshToken(integration);
    }
  }

  static async refreshToken(integration: CalendarIntegration): Promise<void> {
    try {
      let response;
      if (integration.provider === "google") {
        response = await axios.post("https://oauth2.googleapis.com/token", {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: integration.refresh_token,
          grant_type: "refresh_token",
        });
      } else if (integration.provider === "outlook") {
        response = await axios.post(
          "https://login.microsoftonline.com/common/oauth2/v2.0/token",
          {
            client_id: process.env.MICROSOFT_CLIENT_ID,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET,
            refresh_token: integration.refresh_token,
            grant_type: "refresh_token",
          }
        );
      }

      if (response) {
        integration.access_token = response.data.access_token;
        integration.expires_at = new Date(
          Date.now() + response.data.expires_in * 1000
        );
        await AppDataSource.getRepository(CalendarIntegration).save(
          integration
        );
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }

  static async syncGoogleCalendar(
    integration: CalendarIntegration
  ): Promise<void> {
    await this.ensureValidToken(integration);
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
          },
          params: {
            timeMin: new Date().toISOString(),
            maxResults: 2500,
            singleEvents: true,
            orderBy: "startTime",
          },
        }
      );

      const events: CalendarEvent[] = response.data.items.map((item: any) => ({
        id: item.id,
        title: item.summary || "Untitled Event",
        description: item.description,
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
        location: item.location,
      }));

      await this.saveEvents(events, integration, "google");
    } catch (error) {
      console.error("Google Calendar sync error:", error);
      throw error;
    }
  }

  static async syncMicrosoftCalendar(
    integration: CalendarIntegration
  ): Promise<void> {
    await this.ensureValidToken(integration);
    try {
      const response = await axios.get(
        "https://graph.microsoft.com/v1.0/me/events",
        {
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
          },
          params: {
            $top: 100,
            $orderby: "start/dateTime",
            $filter: `start/dateTime ge '${new Date().toISOString()}'`,
          },
        }
      );

      const events: CalendarEvent[] = response.data.value.map((item: any) => ({
        id: item.id,
        title: item.subject || "Untitled Event",
        description: item.body?.content,
        start: new Date(item.start.dateTime),
        end: new Date(item.end.dateTime),
        location: item.location?.displayName,
      }));

      await this.saveEvents(events, integration, "outlook");
    } catch (error) {
      console.error("Microsoft Calendar sync error:", error);
      throw error;
    }
  }

  static async syncAppleCalendar(
    integration: CalendarIntegration
  ): Promise<void> {
    // Apple Calendar uses CalDAV
    // This is a simplified implementation - in production, you'd use a CalDAV client
    try {
      // For now, skip Apple Calendar sync
      console.log("Apple Calendar sync not implemented yet");
    } catch (error) {
      console.error("Apple Calendar sync error:", error);
      throw error;
    }
  }

  static async syncFastmailCalendar(
    integration: CalendarIntegration
  ): Promise<void> {
    // Fastmail uses CalDAV
    try {
      // For now, skip Fastmail sync
      console.log("Fastmail Calendar sync not implemented yet");
    } catch (error) {
      console.error("Fastmail Calendar sync error:", error);
      throw error;
    }
  }

  private static async saveEvents(
    events: CalendarEvent[],
    integration: CalendarIntegration,
    source: string
  ): Promise<void> {
    for (const event of events) {
      // Check if event already exists
      const existingEvent = await eventRepository.findOne({
        where: {
          user: { id: integration.user.id },
          external_id: event.id,
          source,
        },
      });

      if (existingEvent) {
        // Update existing event
        existingEvent.title = event.title;
        existingEvent.description = event.description || "";
        existingEvent.start_time = event.start;
        existingEvent.end_time = event.end;
        existingEvent.location = event.location || "";
        existingEvent.updated_at = new Date();
        await eventRepository.save(existingEvent);
      } else {
        // Create new event
        const newEvent = eventRepository.create({
          title: event.title,
          description: event.description,
          start_time: event.start,
          end_time: event.end,
          location: event.location,
          source,
          external_id: event.id,
          user: integration.user,
        });
        await eventRepository.save(newEvent);
      }
    }
  }

  static async syncAllCalendars(userId: number): Promise<void> {
    const integrations = await AppDataSource.getRepository(
      CalendarIntegration
    ).find({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    for (const integration of integrations) {
      switch (integration.provider) {
        case "google":
          await this.syncGoogleCalendar(integration);
          break;
        case "outlook":
          await this.syncMicrosoftCalendar(integration);
          break;
        case "apple":
          await this.syncAppleCalendar(integration);
          break;
        case "fastmail":
          await this.syncFastmailCalendar(integration);
          break;
      }
    }
  }
}
