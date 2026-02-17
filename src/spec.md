# Specification

## Summary
**Goal:** Build a secure productivity web app with authenticated access, end-to-end encrypted private notes, local date/time extraction for event suggestions, and a calendar/dashboard UI—implemented with a feature-based layered frontend architecture and a single Motoko actor backend.

**Planned changes:**
- Organize the frontend into feature-based modules (auth, notes, calendar, dashboard, settings) with a layered flow: UI → feature hooks/state → service layer → actor client (no direct actor calls from components).
- Implement Internet Identity sign-in/sign-out, show the authenticated principal in the UI, and enforce authenticated caller-only access on backend note/event operations.
- Add notes CRUD with an `isPrivate` flag; store private note content as ciphertext on the backend and decrypt/encrypt on the client.
- Implement a client-side AES-256 Web Crypto encryption service with a per-user key stored locally; show a clear UI state when a private note cannot be decrypted due to missing key.
- Add a local (rule-based) NLP/date-time extraction module that returns `{ date, time, confidence }` from note text with no external AI/LLM calls.
- Implement calendar CRUD with a monthly view and daily agenda; support creating events manually and creating an event from a note using extracted date/time.
- Create a dashboard showing recent notes and today’s agenda with navigation to Notes, Calendar, and Settings.
- Add a Settings screen with at least one encryption-key management action (e.g., reset local key with confirmation and impact explanation), in English.
- Add a step-by-step implementation plan document in the repo mapping milestones to routes/features and backend methods/types.
- Apply a coherent, consistent Tailwind-based visual theme (non-default; not blue/purple primary) across all screens using composed existing UI components.

**User-visible outcome:** Users can sign in with Internet Identity, manage notes (including private encrypted notes), see suggested events from detected dates/times in notes, manage events in a calendar with monthly and daily views, use a dashboard for quick access to recent notes and today’s agenda, and manage encryption key actions in Settings—all with a consistent theme.
