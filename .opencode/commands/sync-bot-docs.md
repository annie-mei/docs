---
description: Sync Mintlify docs from the source repo
agent: build
---
Purpose: update stale or incorrect docs so the Mintlify docs in this repo match the current Annie Mei implementation.

Load and follow the local `mintlify` skill.

Resolve the source repo path in this order:
1. Use this command argument if provided: `$ARGUMENTS`
2. Otherwise use this configured default path:
!`printf '%s\n' "${ANNIE_MEI_SOURCE_REPO:-../annie-mei}"`

When you run this command:
1. Determine the resolved source repo path and state it clearly.
2. Inspect the current implementation in that source repo before trusting existing docs.
3. Compare the implementation against the relevant docs in this repo and actively look for incorrect information, not just obviously stale content.
4. Update only docs that are stale, inaccurate, misleading, missing key user-facing guidance, or harder to follow than they need to be.
5. Keep the docs easy to read for end users, especially for setup, commands, and other basic workflows.
6. Prefer small, targeted edits over broad rewrites.
7. Do not make frivolous wording changes, style-only rewrites, or no-op edits unless explicitly requested. If the docs already match the implementation, leave them unchanged.
8. Only modify files in this docs repo.
9. Call out anything ambiguous, missing in code, or too implementation-specific to document confidently.

Goal: after the update, the docs should clearly match the implementation, avoid incorrect guidance, and be easy for a user to read and follow.
