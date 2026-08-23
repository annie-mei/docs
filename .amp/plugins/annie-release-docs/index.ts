import type { PluginAPI, WebhookRegistration } from '@ampcode/plugin'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { parsePublishedRelease } from './github-release'
import { ReleaseProcessor } from './release-processor'
import { ReleaseStateStore } from './release-state'

export const description =
  'Starts a docs orb thread when a stable Annie Mei GitHub release is published.'

function stateDirectory(): string {
  const stateHome = process.env.XDG_STATE_HOME ?? join(homedir(), '.local', 'state')
  return join(stateHome, 'amp', 'annie-release-docs')
}

export default async function (amp: PluginAPI) {
  const secret = process.env.ANNIE_MEI_RELEASE_WEBHOOK_SECRET
  const store = new ReleaseStateStore(stateDirectory())
  const agent = amp.getBuiltinAgent('medium')
  const processor = new ReleaseProcessor(store, {
    createThread: (parentThreadID) =>
      agent.createThread({ executor: 'orb', parentThreadID, features: [] }),
    getThread: (threadID) => amp.threads.get(threadID),
  })
  let registrationPromise: Promise<WebhookRegistration> | undefined

  async function ensureWebhook(): Promise<WebhookRegistration> {
    if (!secret) throw new Error('ANNIE_MEI_RELEASE_WEBHOOK_SECRET is not set.')

    registrationPromise ??= amp.createWebhook({
      key: 'annie-mei-stable-release-v1',
      headers: ['x-github-delivery', 'x-github-event', 'x-hub-signature-256'],
      handler: async (event, ctx) => {
        const release = await parsePublishedRelease(event.body, event.headers, secret)
        if (!release) {
          ctx.logger.log('Ignored an invalid or non-stable Annie Mei release webhook event.')
          return
        }

        await processor.process(release, ctx.thread.id, (message) => ctx.logger.log(message))
      },
    })

    try {
      return await registrationPromise
    } catch (error) {
      registrationPromise = undefined
      throw error
    }
  }

  amp.registerCommand(
    'configure-annie-release-webhook',
    {
      title: 'Configure Annie Mei release webhook',
      category: 'release docs',
      description: 'Enable this orb as the sole release controller and show its private webhook URL.',
    },
    async (ctx) => {
      if (!ctx.thread) {
        await ctx.ui.notify('Start a docs orb thread before configuring the release webhook.')
        return
      }
      if (!secret) {
        await ctx.ui.notify(
          'Add ANNIE_MEI_RELEASE_WEBHOOK_SECRET to the docs Amp project, restart the orb, and try again.',
        )
        return
      }

      await ctx.thread.setVisibility('private')
      await store.enableController(ctx.thread.id)
      const registration = await ensureWebhook()
      await ctx.ui.notify(
        `This private orb is now the release controller. Configure this URL for Annie Mei GitHub release events and keep it private:\n${registration.url}`,
      )
    },
  )

  const controllerThreadID = await store.controllerThreadID()
  if (!controllerThreadID) {
    amp.logger.log('Annie Mei release docs webhook is disabled in this non-controller orb.')
    return
  }
  if (!secret) {
    amp.logger.log(
      'Annie Mei release docs controller is disabled: ANNIE_MEI_RELEASE_WEBHOOK_SECRET is not set.',
    )
    return
  }

  await ensureWebhook()
  amp.logger.log(`Annie Mei release docs webhook registered for controller ${controllerThreadID}.`)
}
