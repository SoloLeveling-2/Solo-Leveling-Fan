# Solo Leveling Hunter Tracker

A Solo Leveling-inspired workout tracker with onboarding, profile editing, daily quests, meals, weight, sessions, achievements, and progress tracked through a local Express API.

## Local data persistence

During local development, the API stores app data in:

```text
server/data/db.json
```

That file is the source of truth for profile, onboarding completion, checklist state, meals, weight entries, workout sessions, achievements, exercise media, and progress. Refreshing `http://localhost:5173` should not reset those values because the React app loads from the API instead of recreating default client state.

## Resetting local data manually

Use one of these reset options only when you intentionally want to wipe local data:

1. Click **Reset All Data** on the Profile page. This is the only UI path that calls `/api/reset`.
2. Stop the server and replace `server/data/db.json` with a fresh default JSON file.
3. Delete `server/data/db.json`; the server will recreate it with defaults the next time it starts.

Do not call `/api/reset` from startup, page refresh, onboarding, or profile save flows.

## Saving behavior

- Profile edits save only after clicking **Save Profile**.
- Onboarding writes `profile.onboarded = true` and stays completed after refresh.
- Checklist progress, meals, weights, sessions, achievements, exercise media, and progress are written to `server/data/db.json` during local development.
- Save failures are shown as visible error messages in the app.
- Successful saves show visible confirmations where the user takes an action.
