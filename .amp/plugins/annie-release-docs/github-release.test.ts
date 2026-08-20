import { describe, expect, test } from 'bun:test'

import { buildDocumentationPrompt, parsePublishedRelease } from './github-release'

const secret = 'test-webhook-secret'

async function signedEvent(
  payload: unknown,
  headers: Record<string, string> = {},
): Promise<{ body: Uint8Array; headers: Record<string, string> }> {
  const body = new TextEncoder().encode(JSON.stringify(payload))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, body))
  const signatureHex = Array.from(signature, (byte) => byte.toString(16).padStart(2, '0')).join('')

  return {
    body,
    headers: {
      'x-github-delivery': '7f54a6f0-1234-5678-9abc-123456789abc',
      'x-github-event': 'release',
      'x-hub-signature-256': `sha256=${signatureHex}`,
      ...headers,
    },
  }
}

function releasePayload(overrides: Record<string, unknown> = {}) {
  return {
    action: 'published',
    repository: { full_name: 'annie-mei/annie-mei' },
    release: { tag_name: 'v3.10.0', draft: false, prerelease: false },
    ...overrides,
  }
}

describe('parsePublishedRelease', () => {
  test('accepts a signed stable Annie Mei release', async () => {
    const event = await signedEvent(releasePayload())

    await expect(parsePublishedRelease(event.body, event.headers, secret)).resolves.toEqual({
      deliveryID: '7f54a6f0-1234-5678-9abc-123456789abc',
      tag: 'v3.10.0',
    })
  })

  test('rejects an invalid signature', async () => {
    const event = await signedEvent(releasePayload(), {
      'x-hub-signature-256': `sha256=${'0'.repeat(64)}`,
    })

    await expect(parsePublishedRelease(event.body, event.headers, secret)).resolves.toBeNull()
  })

  test('rejects releases from another repository', async () => {
    const event = await signedEvent(
      releasePayload({ repository: { full_name: 'someone/annie-mei' } }),
    )

    await expect(parsePublishedRelease(event.body, event.headers, secret)).resolves.toBeNull()
  })

  test('rejects prereleases and non-semver tags', async () => {
    const prerelease = await signedEvent(
      releasePayload({
        release: { tag_name: 'v3.10.0-rc.1', draft: false, prerelease: true },
      }),
    )
    const nonSemver = await signedEvent(
      releasePayload({ release: { tag_name: 'latest', draft: false, prerelease: false } }),
    )

    await expect(parsePublishedRelease(prerelease.body, prerelease.headers, secret)).resolves.toBeNull()
    await expect(parsePublishedRelease(nonSemver.body, nonSemver.headers, secret)).resolves.toBeNull()
  })
})

test('buildDocumentationPrompt contains only deterministic release context', () => {
  const prompt = buildDocumentationPrompt({
    deliveryID: '7f54a6f0-1234-5678-9abc-123456789abc',
    tag: 'v3.10.0',
  })

  expect(prompt).toContain('[annie-release-docs:v3.10.0]')
  expect(prompt).toContain('/tmp/annie-mei-source-v3.10.0')
  expect(prompt).toContain('Never merge the pull request.')
})
