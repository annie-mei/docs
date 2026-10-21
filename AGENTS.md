# Documentation project instructions

<!-- BEGIN ANNIE MEI SHARED WORKFLOW -->
<!-- Source: annie-mei/.github/AGENTS.md. Keep this block identical in all four repos. -->
## Annie Mei organization workflow

Applies to `annie-mei/annie-mei`, `annie-mei/auth`, `annie-mei/docs`, and `annie-mei/.github`.

- Every work branch must have a Linear ticket and use the ticket's suggested branch name.
- Check existing and recent tickets before proposing a new one. Ask the user before creating a ticket.
- PR titles must use `[ANNIE-<ticket-number>]/<description>`.
- Do not mention or link Linear tickets in PR descriptions; branch automation supplies the link.
- Fill the repository's existing `.github/PULL_REQUEST_TEMPLATE.md`. Do not duplicate the template in agent guidance.
- If the repository has no PR template, reuse the existing bot template: https://github.com/annie-mei/annie-mei/blob/main/.github/PULL_REQUEST_TEMPLATE.md
- Remove placeholder comments and unused optional sections. Record validation actually performed and replace `MODEL_NAME` with the actual model.
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
