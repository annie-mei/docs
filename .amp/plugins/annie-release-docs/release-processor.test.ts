import { describe, expect, test } from 'bun:test'
import type { PluginThread, ThreadID, ThreadMessage } from '@ampcode/plugin'

import type { PublishedRelease } from './github-release'
import { ReleaseProcessor, type ReleaseStatePersistence } from './release-processor'
import type { ReleaseClaim, ReleaseState } from './release-state'

const release: PublishedRelease = { deliveryID: 'delivery-1', tag: 'v3.10.0' }
const parentThreadID = 'T-parent' as ThreadID

class FakeStore implements ReleaseStatePersistence {
  state: ReleaseState | undefined
  saves = 0
  failSaves = 0

  async claim(_tag: string, deliveryID: string): Promise<ReleaseClaim> {
    if (this.state) return { kind: 'existing', state: this.state }

    this.state = {
      deliveryID,
      status: 'starting',
      updatedAt: new Date().toISOString(),
    }
    return { kind: 'claimed', state: this.state }
  }

  async save(_tag: string, state: ReleaseState): Promise<void> {
    this.saves += 1
    if (this.failSaves > 0) {
      this.failSaves -= 1
      throw new Error('disk unavailable')
    }
    this.state = { ...state, updatedAt: new Date().toISOString() }
  }
}

function fakeThread(id: ThreadID) {
  const messages: ThreadMessage[] = []
  const thread = {
    id,
    async messages() {
      return messages
    },
    async appendUserMessage(message: { type: 'user-message'; content: string }) {
      messages.push({
        role: 'user',
        id: messages.length + 1,
        content: [{ type: 'text', text: message.content }],
      })
    },
  } as PluginThread

  return { messages, thread }
}

describe('ReleaseProcessor', () => {
  test('creates and prompts one thread for a release', async () => {
    const store = new FakeStore()
    const created = fakeThread('T-created' as ThreadID)
    let createCalls = 0
    const processor = new ReleaseProcessor(store, {
      async createThread() {
        createCalls += 1
        return created.thread
      },
      getThread() {
        return created.thread
      },
    })

    await processor.process(release, parentThreadID, () => {})
    await processor.process(release, parentThreadID, () => {})

    expect(createCalls).toBe(1)
    expect(created.messages).toHaveLength(1)
    expect(store.state).toMatchObject({ status: 'started', threadID: 'T-created' })
  })

  test('reuses the created thread when persistence fails and the webhook retries', async () => {
    const store = new FakeStore()
    store.failSaves = 2
    const created = fakeThread('T-created' as ThreadID)
    let createCalls = 0
    const processor = new ReleaseProcessor(store, {
      async createThread() {
        createCalls += 1
        return created.thread
      },
      getThread() {
        return created.thread
      },
    })

    await expect(processor.process(release, parentThreadID, () => {})).rejects.toThrow(
      'disk unavailable',
    )
    await processor.process(release, parentThreadID, () => {})

    expect(createCalls).toBe(1)
    expect(created.messages).toHaveLength(1)
    expect(store.state).toMatchObject({ status: 'started', threadID: 'T-created' })
  })

  test('fails closed after a restart loses an unpersisted created thread ID', async () => {
    const store = new FakeStore()
    store.failSaves = 2
    const created = fakeThread('T-created' as ThreadID)
    let createCalls = 0
    const runtime = {
      async createThread() {
        createCalls += 1
        return created.thread
      },
      getThread() {
        return created.thread
      },
    }

    const firstProcessor = new ReleaseProcessor(store, runtime)
    await expect(firstProcessor.process(release, parentThreadID, () => {})).rejects.toThrow(
      'disk unavailable',
    )

    store.state = { ...store.state!, updatedAt: '2000-01-01T00:00:00.000Z' }
    const restartedProcessor = new ReleaseProcessor(store, runtime)
    await expect(restartedProcessor.process(release, parentThreadID, () => {})).rejects.toThrow(
      'refusing to create a duplicate thread',
    )

    expect(createCalls).toBe(1)
    expect(created.messages).toHaveLength(1)
  })
})
