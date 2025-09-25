// @ts-ignore
import MicrosoftStrategy from "passport-microsoft";
// @ts-ignore
import AppleStrategy from "passport-apple";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AppDataSource } from "../data-source";
import { CalendarIntegration } from "../entities/CalendarIntegration";

const calendarIntegrationRepository =
  AppDataSource.getRepository(CalendarIntegration);

// Google Calendar Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id' &&
    process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret') {
  passport.use(
    "google-calendar",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${
          process.env.BASE_URL || "http://localhost:3000"
        }/api/calendars/google/callback`,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        try {
          // This will be handled in the callback route
          done(null, { accessToken, refreshToken, profile, provider: "google" });
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

// Microsoft Outlook Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_ID !== 'your_microsoft_client_id' &&
    process.env.MICROSOFT_CLIENT_SECRET && process.env.MICROSOFT_CLIENT_SECRET !== 'your_microsoft_client_secret') {
  passport.use(
    "microsoft-calendar",
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: `${
          process.env.BASE_URL || "http://localhost:3000"
        }/api/calendars/microsoft/callback`,
        scope: ["https://graph.microsoft.com/Calendars.Read"],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        try {
          done(null, { accessToken, refreshToken, profile, provider: "outlook" });
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

// Apple Calendar Strategy (Sign in with Apple, then use CalDAV)
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_ID !== 'your_apple_client_id' &&
    process.env.APPLE_TEAM_ID && process.env.APPLE_TEAM_ID !== 'your_apple_team_id' &&
    process.env.APPLE_KEY_ID && process.env.APPLE_KEY_ID !== 'your_apple_key_id' &&
    process.env.APPLE_PRIVATE_KEY_PATH && process.env.APPLE_PRIVATE_KEY_PATH !== 'your_apple_private_key_path') {
  passport.use(
    "apple-calendar",
    new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
        callbackURL: `${
          process.env.BASE_URL || "http://localhost:3000"
        }/api/calendars/apple/callback`,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        try {
          done(null, { accessToken, refreshToken, profile, provider: "apple" });
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

// For Fastmail, since no standard strategy, we'll handle it manually in routes

export default passport;
