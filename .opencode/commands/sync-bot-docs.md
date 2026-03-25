---
description: Sync Mintlify docs from the source repo
agent: build
---
Load and follow the local `mintlify` skill.

Resolve the source repo path in this order:
1. Use this command argument if provided: `$ARGUMENTS`
2. Otherwise use this configured default path:
!`printf '%s\n' "${ANNIE_MEI_SOURCE_REPO:-../annie-mei}"`

Before editing docs:
1. Determine the resolved source repo path and state it clearly.
2. Inspect the current implementation in that source repo.
3. Compare the implementation against the relevant docs in this repo.
4. Update stale Mintlify docs only in this repo.
5. Call out anything ambiguous, missing in code, or too implementation-specific to document confidently.
