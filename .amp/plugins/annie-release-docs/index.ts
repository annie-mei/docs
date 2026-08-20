import type { PluginAPI, PluginThread, ThreadID } from '@ampcode/plugin'
import { homedir } from 'node:os'
import { join } from 'node:path'

import {
  buildDocumentationPrompt,
  parsePublishedRelease,
  promptMarker,
} from './github-release'
import { ReleaseStateStore, type ReleaseState } from './release-state'

export const description =
  'Starts a docs orb thread when a stable Annie Mei GitHub release is published.'

const STARTING_TIMEOUT_MS = 5 * 60 * 1000

function stateDirectory(): string {
  const stateHome = process.env.XDG_STATE_HOME ?? join(homedir(), '.local', 'state')
  return join(stateHome, 'amp', 'annie-release-docs')
}

function isStale(state: ReleaseState): boolean {
  return Date.now() - Date.parse(state.updatedAt) >= STARTING_TIMEOUT_MS
}

async function hasReleasePrompt(thread: PluginThread, marker: string): Promise<boolean> {
  const messages = await thread.messages({ from: 'end', limit: 20, roles: ['user'] })
  return messages.some(
    (message) =>
      message.role === 'user' &&
      message.content.some((block) => block.type === 'text' && block.text.includes(marker)),
  )
}

export default async function (amp: PluginAPI) {
  const secret = process.env.ANNIE_MEI_RELEASE_WEBHOOK_SECRET
  if (!secret) {
    amp.logger.log(
      'Annie Mei release docs webhook is disabled: ANNIE_MEI_RELEASE_WEBHOOK_SECRET is not set.',
    )
    return
  }

  const store = new ReleaseStateStore(stateDirectory())
  const agent = amp.getBuiltinAgent('medium')
  const registration = await amp.createWebhook({
    key: 'annie-mei-stable-release-v1',
    headers: ['x-github-delivery', 'x-github-event', 'x-hub-signature-256'],
    handler: async (event, ctx) => {
      const release = await parsePublishedRelease(event.body, event.headers, secret)
      if (!release) {
        ctx.logger.log('Ignored an invalid or non-stable Annie Mei release webhook event.')
        return
      }

      const claim = await store.claim(release.tag, release.deliveryID)
      let state = claim.state

      if (state.status === 'started') {
        ctx.logger.log(`Documentation thread already started for ${release.tag}.`)
        return
      }

      if (state.status === 'starting' && claim.kind === 'existing' && !isStale(state)) {
        throw new Error(`Documentation thread creation is already in progress for ${release.tag}.`)
      }

      let thread: PluginThread
      if (state.status === 'created' && state.threadID) {
        thread = amp.threads.get(state.threadID as ThreadID)
      } else {
        try {
          thread = await agent.createThread({
            executor: 'orb',
            parentThreadID: ctx.thread.id,
            features: [],
          })
          state = {
            deliveryID: release.deliveryID,
            status: 'created',
            threadID: thread.id,
            updatedAt: new Date().toISOString(),
          }
          await store.save(release.tag, state)
        } catch (error) {
          await store.clear(release.tag)
          throw error
        }
      }

      const marker = promptMarker(release.tag)
      if (!(await hasReleasePrompt(thread, marker))) {
        await thread.appendUserMessage({
          type: 'user-message',
          content: buildDocumentationPrompt(release),
        })
      }

      await store.save(release.tag, { ...state, status: 'started', threadID: thread.id })
      ctx.logger.log(`Started documentation thread ${thread.id} for ${release.tag}.`)
    },
  })

  amp.registerCommand(
    'show-annie-release-webhook-url',
    {
      title: 'Show Annie Mei release webhook URL',
      category: 'release docs',
      description: 'Show the credential-bearing URL to configure as the GitHub release webhook.',
    },
    async (ctx) => {
      await ctx.ui.notify(
        `Configure this URL for Annie Mei GitHub release events and keep it private:\n${registration.url}`,
      )
    },
  )

  amp.logger.log('Annie Mei release docs webhook registered.')
}
