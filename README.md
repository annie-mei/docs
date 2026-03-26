# Annie Mei — Documentation

This repo contains the [Mintlify](https://mintlify.com) documentation site for [Annie Mei](https://github.com/annie-mei/annie-mei), a Discord bot written in Rust that fetches anime and manga data from AniList, with theme song lookups via MyAnimeList and Spotify.

## Local development

Install the [Mintlify CLI](https://www.npmjs.com/package/mint):

```bash
npm i -g mint
```

Run the dev server from the root of this repo (where `docs.json` lives):

```bash
mint dev
```

Preview at `http://localhost:3000`. Check for broken links with:

```bash
mint broken-links
```

## Publishing

Changes pushed to the default branch are deployed automatically via the Mintlify GitHub app.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
