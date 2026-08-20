import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { ReleaseStateStore } from './release-state'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })))
})

async function createStore(): Promise<ReleaseStateStore> {
  const directory = await mkdtemp(join(tmpdir(), 'annie-release-docs-'))
  directories.push(directory)
  return new ReleaseStateStore(directory)
}

describe('ReleaseStateStore', () => {
  test('claims a release once', async () => {
    const store = await createStore()

    const first = await store.claim('v3.10.0', 'delivery-1')
    const second = await store.claim('v3.10.0', 'delivery-2')

    expect(first.kind).toBe('claimed')
    expect(second).toEqual({ kind: 'existing', state: first.state })
  })

  test('persists a created thread for retry recovery', async () => {
    const store = await createStore()
    const claim = await store.claim('v3.10.0', 'delivery-1')

    await store.save('v3.10.0', {
      ...claim.state,
      status: 'created',
      threadID: 'T-test-thread',
    })

    expect(await store.read('v3.10.0')).toMatchObject({
      deliveryID: 'delivery-1',
      status: 'created',
      threadID: 'T-test-thread',
    })
  })
})
