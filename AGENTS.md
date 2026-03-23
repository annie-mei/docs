> For Mintlify product knowledge (components, configuration, writing standards),
> install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# Documentation project instructions

## About this project

- This repo is the Mintlify documentation site for Annie Mei
- Annie Mei is a Rust Discord bot that looks up anime and manga data from AniList, plus theme songs from MyAnimeList and Spotify
- The product source repo lives at `https://github.com/annie-mei/annie-mei`
- Use the source repo as the source of truth for behavior, commands, environment variables, and architecture details
- The paths below are repo-relative paths within that GitHub repository:
  - `Cargo.toml`
  - `README.md`
  - `src/commands/`
  - `src/utils/`
  - `src/models/`
  - `migrations/`
  - `.env.example`
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Run `mint dev` to preview locally
- Run `mint broken-links` to check links

## Terminology

- Use "Annie Mei" for the product name
- Use "Discord bot" for the product category
- Use "Discord server" in user-facing docs; use "guild" only when describing Discord API concepts or internal implementation
- Use "slash command" when referring to `/anime`, `/manga`, `/songs`, `/register`, `/help`, and similar commands
- Use "member" when describing people inside a Discord server
- Use "AniList account" for linked identities and "AniList ID" for numeric media identifiers

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise - one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references
- Lead with the user outcome, then explain technical detail
- For command docs, show the slash command syntax early and keep examples realistic
- For development docs, anchor implementation claims to the source repo instead of guessing from older docs

## Content boundaries

- Document public bot features, setup, deployment, development workflows, and external integrations that exist in the source repo
- Do not invent commands, environment variables, API behavior, or infrastructure that cannot be verified in `https://github.com/annie-mei/annie-mei`
- Do not expose secrets, private credentials, or operational values that are not meant to be committed
- When implementation and docs disagree, update the docs to match the source repo or leave a clearly marked TODO if verification is still needed
