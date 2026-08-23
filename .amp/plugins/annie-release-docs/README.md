# Annie Mei release docs webhook

This project plugin registers a durable Amp webhook in a controller thread belonging to the Annie Mei docs project. A signed stable release event from `annie-mei/annie-mei` starts a fresh medium-mode orb thread that reviews the released bot and current auth service implementations, then updates this documentation.

## Configure

1. Generate a strong random webhook secret.
2. Add it to the docs Amp project's secrets as `ANNIE_MEI_RELEASE_WEBHOOK_SECRET`.
3. Start a controller orb thread in the docs project and leave it unarchived.
4. Run **release docs: Configure Annie Mei release webhook** from that thread's command palette. This writes a controller marker only in that orb and displays its private URL.
5. In the `annie-mei/annie-mei` repository webhook settings, add the displayed URL with:
   - **Content type:** `application/json`
   - **Secret:** the same `ANNIE_MEI_RELEASE_WEBHOOK_SECRET` value
   - **Events:** Releases only
   - **Active:** enabled

Treat both the Amp webhook URL and signing secret as credentials. Do not commit or log them.

## Behavior

- Only `published` stable tags matching `vX.Y.Z` are accepted.
- Only the explicitly configured controller orb registers a durable webhook; spawned docs orbs remain listeners-free.
- GitHub HMAC-SHA256 signatures are verified before parsing event fields.
- Release tags are persisted in the controller orb to suppress redeliveries and recover partially-started threads.
- Ambiguous `starting` claims fail closed instead of creating another billable thread. Inspect the existing child thread before manually removing a stuck release state from `~/.local/state/amp/annie-release-docs/`.
- Each release thread inspects the exact bot release tag and records the current `annie-mei/auth` commit it uses. The auth service has no release tags of its own.
- A release thread opens a docs pull request when changes are needed and reports a no-op otherwise. It never merges automatically.

Run the plugin's unit tests with:

```bash
bun test ./.amp/plugins/annie-release-docs/*.test.ts
```
