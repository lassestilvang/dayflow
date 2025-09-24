import { Router } from "express";
import passport from "../config/passport";
import { AppDataSource } from "../data-source";
import { CalendarIntegration } from "../entities/CalendarIntegration";
import { User } from "../entities/User";
import { authenticateToken } from "../middleware/auth";
import { CalendarService } from "../services/calendarService";

const router = Router();
const calendarIntegrationRepository =
  AppDataSource.getRepository(CalendarIntegration);
const userRepository = AppDataSource.getRepository(User);

// Initiate OAuth for a provider
router.get("/initiate/:provider", authenticateToken, (req, res) => {
  const { provider } = req.params;
  const user = req.user as User;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const strategies = {
    google: "google-calendar",
    microsoft: "microsoft-calendar",
    apple: "apple-calendar",
  };

  const strategy = strategies[provider as keyof typeof strategies];
  if (!strategy) {
    return res.status(400).json({ error: "Unsupported provider" });
  }

  // Store user ID in session for callback
  (req as any).session = { userId: user.id };

  passport.authenticate(strategy)(req, res);
});

// OAuth callback
router.get(
  "/:provider/callback",
  passport.authenticate(
    ["google-calendar", "microsoft-calendar", "apple-calendar"],
    {
      failureRedirect: "/api/calendars/error",
    }
  ),
  async (req, res) => {
    try {
      const { provider } = req.params;
      const user = req.user as any; // From strategy
      const userId = (req as any).session?.userId;

      if (!userId) {
        return res.status(400).json({ error: "Session expired" });
      }

      // Save or update integration
      let integration = await calendarIntegrationRepository.findOne({
        where: { user: { id: userId }, provider },
      });

      if (!integration) {
        integration = calendarIntegrationRepository.create({
          user: { id: userId } as User,
          provider,
        });
      }

      integration.access_token = user.accessToken;
      integration.refresh_token = user.refreshToken;
      integration.expires_at = new Date(Date.now() + 3600 * 1000); // Assume 1 hour
      integration.scope = user.scope;
      integration.token_type = user.tokenType || "Bearer";

      await calendarIntegrationRepository.save(integration);

      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/settings/calendars?success=true`
      );
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/settings/calendars?error=true`
      );
    }
  }
);

// Get user's calendar integrations
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = req.user as User;
    const integrations = await calendarIntegrationRepository.find({
      where: { user: { id: user.id } },
      select: ["id", "provider", "created_at", "updated_at"],
    });
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch integrations" });
  }
});

// Disconnect a calendar
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user as User;
    const integration = await calendarIntegrationRepository.findOne({
      where: { id: parseInt(req.params.id), user: { id: user.id } },
    });

    if (!integration) {
      return res.status(404).json({ error: "Integration not found" });
    }

    await calendarIntegrationRepository.remove(integration);
    res.json({ message: "Calendar disconnected" });
  } catch (error) {
    res.status(500).json({ error: "Failed to disconnect calendar" });
  }
});

// Sync events from all connected calendars
router.post("/sync", authenticateToken, async (req, res) => {
  try {
    const user = req.user as User;
    await CalendarService.syncAllCalendars(user.id);
    res.json({ message: "Sync completed successfully" });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});

export default router;
