import type { PluginThread, ThreadID } from '@ampcode/plugin'

import type { PublishedRelease } from './github-release'
import { buildDocumentationPrompt, promptMarker } from './github-release'
import type { ReleaseClaim, ReleaseState } from './release-state'

export interface ReleaseStatePersistence {
  claim(tag: string, deliveryID: string): Promise<ReleaseClaim>
  save(tag: string, state: ReleaseState): Promise<void>
}

export interface ReleaseThreadRuntime {
  createThread(parentThreadID: ThreadID): Promise<PluginThread>
  getThread(threadID: ThreadID): PluginThread
}

async function hasReleasePrompt(thread: PluginThread, marker: string): Promise<boolean> {
  const messages = await thread.messages({ from: 'end', limit: 20, roles: ['user'] })
  return messages.some(
    (message) =>
      message.role === 'user' &&
      message.content.some((block) => block.type === 'text' && block.text.includes(marker)),
  )
}

export class ReleaseProcessor {
  private readonly createdThreads = new Map<string, ThreadID>()

  constructor(
    private readonly store: ReleaseStatePersistence,
    private readonly runtime: ReleaseThreadRuntime,
  ) {}

  async process(
    release: PublishedRelease,
    parentThreadID: ThreadID,
    log: (message: string) => void,
  ): Promise<void> {
    const claim = await this.store.claim(release.tag, release.deliveryID)
    let state = claim.state

    if (state.status === 'started') {
      log(`Documentation thread already started for ${release.tag}.`)
      return
    }

    let thread: PluginThread
    const rememberedThreadID = this.createdThreads.get(release.tag)
    if (rememberedThreadID) {
      thread = this.runtime.getThread(rememberedThreadID)
    } else if (state.status === 'created' && state.threadID) {
      thread = this.runtime.getThread(state.threadID as ThreadID)
      this.createdThreads.set(release.tag, thread.id)
    } else {
      if (claim.kind === 'existing') {
        throw new Error(
          `Documentation thread creation for ${release.tag} has an ambiguous starting claim; refusing to create a duplicate thread.`,
        )
      }

      thread = await this.runtime.createThread(parentThreadID)
      this.createdThreads.set(release.tag, thread.id)
      state = {
        deliveryID: release.deliveryID,
        status: 'created',
        threadID: thread.id,
        updatedAt: new Date().toISOString(),
      }

      try {
        await this.store.save(release.tag, state)
      } catch (error) {
        log(`Could not persist created thread ${thread.id} for ${release.tag}: ${String(error)}`)
      }
    }

    const marker = promptMarker(release.tag)
    if (!(await hasReleasePrompt(thread, marker))) {
      await thread.appendUserMessage({
        type: 'user-message',
        content: buildDocumentationPrompt(release),
      })
    }

    await this.store.save(release.tag, { ...state, status: 'started', threadID: thread.id })
    log(`Started documentation thread ${thread.id} for ${release.tag}.`)
  }
}
