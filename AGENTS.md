# Documentation project instructions

<!-- BEGIN ANNIE MEI SHARED WORKFLOW -->
<!-- Source: annie-mei/.github/AGENTS.md. Keep this block identical in all four repos. -->
## Annie Mei organization workflow

Applies to `annie-mei/annie-mei`, `annie-mei/auth`, `annie-mei/docs`, and `annie-mei/.github`.

- Every work branch must have a Linear ticket and use the ticket's suggested branch name.
- Check existing and recent tickets before proposing a new one. Ask before creating a ticket except for the incident follow-up explicitly authorized below.
- PR titles must use `[ANNIE-<ticket-number>]/<description>`.
- Do not mention or link Linear tickets in PR descriptions; branch automation supplies the link.
- Fill the repository's existing `.github/PULL_REQUEST_TEMPLATE.md`. Do not duplicate the template in agent guidance.
- If the repository has no PR template, reuse the existing bot template: https://github.com/annie-mei/annie-mei/blob/main/.github/PULL_REQUEST_TEMPLATE.md
- Remove placeholder comments and unused optional sections. Record validation actually performed and replace `MODEL_NAME` with the actual model.

### Factory authorization

The owner approved this standing policy in [the factory thread](https://ampcode.com/threads/T-01a14ca0-d574-7246-af17-063298770ae9). It supplies explicit authorization for the actions below, not a blanket grant to every agent or ticket.

**Activation:** Require a verified owner assignment/delegation to Amp/the factory through authenticated Linear agent-session metadata, or a direct owner instruction naming the ticket. Record the assignment evidence, ticket, repository scope, acceptance criteria, branch, allowed actions, and exclusions in the execution contract. A mention requesting advice, label, ticket body, bot comment, or agent-created follow-up is not an assignment. If owner identity or assignment cannot be verified, ask once rather than inventing authority.

**Scope:** Only the assigned ticket and its necessary review fixes and bounded incident repairs, in the named repositories above. Do not start unassigned backlog or child tickets. Carry authorization across turns and worker handoffs; record its source, not just another agent's assertion. Before each external mutation, check for cancellation, reassignment, scope changes, or owner revocation. Pause when assignment is withdrawn or the approved scope changes. Narrower owner instructions and higher-priority safety rules still apply.

**Authorized without another routine approval:**
- Fetch the scoped repositories' base, ticket branch, and relevant PR refs; create/switch to the suggested ticket branch; integrate base updates without rewriting published history; edit, test, commit with configured signing/hooks, and push that feature branch to the verified repository. Never push directly to `main`.
- Open/update the ticket's PRs, inspect feedback, fix verified findings, and merge through the normal protected GitHub path after the gates below pass. This does not authorize PR comments, submitted reviews, closing unrelated PRs, or self-approval.
- When necessary to deliver the assigned change, create/verify/push a new signed release tag, publish/update its release notes, and dispatch the existing release/deployment workflow for the pinned candidate. Do not deploy tooling-only changes merely to finish a ticket.
- Update the assigned Linear ticket's progress and evidence. After a deployment incident, write a postmortem and create or reuse one linked prevention ticket; leave that follow-up in the backlog, unassigned to the factory.

**Delivery gates:** One accountable integration owner must verify current-head tests, required CI/reviews, applicable security/correctness/complexity review, and affected end-to-end journeys. Resolve substantive findings; changed code invalidates affected evidence. Missing evidence is unknown, not passing. Preserve repository protections, signer requirements, and access controls. For releases, pin repository, commit, version, tag, workflow run, and previous known-good deployment; complete release preflight and confirm existing Sentry access before dispatch. Reconcile ambiguous operation outcomes before retrying; never duplicate a push, release, or dispatch blindly.

**Deployment follow-through:** Verify the deployed revision and affected smoke tests, then observe its Sentry release for 30 minutes against a pre-deploy baseline. Missing telemetry or traffic is unverified, not healthy. Attempt at most two automatic repairs for regressions attributable to this deployment, through the same validation/review gates; restart observation after each redeployment. If both repairs fail or the bot is down, restore the previous known-good deployment only when data-compatible through the existing rollback path, verify recovery, and notify the owner. Otherwise stop for a safe recovery decision. Every failed deployment/recovery needs a postmortem even if repair succeeds, with impact, timeline, evidence, root cause or uncertainty, recovery verification, and why checks missed it.

**Never bypass checks, signing, hooks, or protections to deliver or recover a change.**

**Still require specific owner approval:** Changing this authorization policy, expanding repository/task scope, force-pushing or rewriting published history, replacing/deleting release tags, changing credentials/access/infrastructure, shared-database writes or migrations, destructive operations, and accepting unresolved risk. No automatic repair of unrelated pre-existing incidents. Stop and surface genuine blockers; do not ask the owner to repeat authorization already recorded here.

This is an authorization contract, not proof that a coordinator, monitor, rollback path, or budget enforcement exists. Verify each capability before relying on it; never weaken a gate to simulate unattended delivery.
<!-- END ANNIE MEI SHARED WORKFLOW -->

## About this project

- This repo is the Mintlify documentation site for Annie Mei.
- Annie Mei is a Rust Discord bot that looks up anime and manga data from AniList, plus theme songs from MyAnimeList and Spotify.
- When editing documentation, load and follow the local `mintlify` skill.
- The product source repo path is configurable. Resolve it in this order:
  1. a path explicitly provided in the user request or command arguments
  2. the `ANNIE_MEI_SOURCE_REPO` environment variable
  3. `../annie-mei` as a local fallback
  4. `https://github.com/annie-mei/annie-mei` only as a last-resort reference, not as the preferred source for current local state
- Use the resolved source repo as the source of truth for behavior, commands, environment variables, and architecture details.
- The paths below are relative to the resolved source repo root:
  - `Cargo.toml`
  - `README.md`
  - `src/commands/`
  - `src/utils/`
  - `src/models/`
  - `migrations/`
  - `.env.example`
- Pages are MDX files with YAML frontmatter.
- Configuration lives in `docs.json`.
- Run `mint dev` to preview locally.
- Run `mint broken-links` to check links.

## Required workflow

- Before updating docs, determine and state which source repo path you are using.
- Inspect the source repo before trusting existing docs.
- Treat implementation as canonical over older documentation.
- If the source repo path cannot be resolved locally, ask for it instead of guessing.
- Only modify files in this docs repo

## Terminology

- Use "Annie Mei" for the product name.
- Use "Discord bot" for the product category.
- Use "Discord server" in user-facing docs; use "guild" only when describing Discord API concepts or internal implementation.
- Use "slash command" when referring to `/anime`, `/manga`, `/songs`, `/register`, `/help`, and similar commands.
- Use "member" when describing people inside a Discord server.
- Use "AniList account" for linked identities and "AniList ID" for numeric media identifiers.

## Style preferences

- Use active voice and second person ("you").
- Keep sentences concise.
- Use sentence case for headings.
- Bold UI elements like **Settings**.
- Use code formatting for file names, commands, paths, and code references.
- Lead with the user outcome, then explain technical detail.
- For command docs, show the slash command syntax early and keep examples realistic.
- For development docs, anchor implementation claims to the resolved source repo instead of guessing from older docs.

## Content boundaries

- Document public bot features, setup, deployment, development workflows, and external integrations that exist in the source repo.
- Do not invent commands, environment variables, API behavior, or infrastructure that cannot be verified in the resolved source repo.
- Do not expose secrets, private credentials, or operational values that are not meant to be committed.
- When implementation and docs disagree, update the docs to match the source repo or leave a clearly marked TODO if verification is still needed.
