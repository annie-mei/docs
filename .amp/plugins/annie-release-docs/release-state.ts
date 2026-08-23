import { link, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export interface ReleaseState {
  deliveryID: string
  status: 'starting' | 'created' | 'started'
  threadID?: string
  updatedAt: string
}

export type ReleaseClaim =
  | { kind: 'claimed'; state: ReleaseState }
  | { kind: 'existing'; state: ReleaseState }

export class ReleaseStateStore {
  constructor(private readonly directory: string) {}

  private path(tag: string): string {
    return join(this.directory, `${tag}.json`)
  }

  private controllerPath(): string {
    return join(this.directory, 'controller.json')
  }

  async controllerThreadID(): Promise<string | null> {
    try {
      const state = JSON.parse(await readFile(this.controllerPath(), 'utf8')) as {
        threadID?: unknown
      }
      return typeof state.threadID === 'string' ? state.threadID : null
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }
  }

  async enableController(threadID: string): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    const path = this.controllerPath()
    const temporaryPath = `${path}.${crypto.randomUUID()}.tmp`

    await writeFile(temporaryPath, `${JSON.stringify({ threadID })}\n`, { mode: 0o600 })
    await rename(temporaryPath, path)
  }

  async claim(tag: string, deliveryID: string): Promise<ReleaseClaim> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })

    const state: ReleaseState = {
      deliveryID,
      status: 'starting',
      updatedAt: new Date().toISOString(),
    }
    const path = this.path(tag)
    const temporaryPath = `${path}.${crypto.randomUUID()}.tmp`

    try {
      await writeFile(temporaryPath, `${JSON.stringify(state)}\n`, { flag: 'wx', mode: 0o600 })
      await link(temporaryPath, path)
      return { kind: 'claimed', state }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
      return { kind: 'existing', state: await this.read(tag) }
    } finally {
      await rm(temporaryPath, { force: true })
    }
  }

  async read(tag: string): Promise<ReleaseState> {
    return JSON.parse(await readFile(this.path(tag), 'utf8')) as ReleaseState
  }

  async save(tag: string, state: ReleaseState): Promise<void> {
    const path = this.path(tag)
    const temporaryPath = `${path}.${crypto.randomUUID()}.tmp`
    const updatedState = { ...state, updatedAt: new Date().toISOString() }

    await writeFile(temporaryPath, `${JSON.stringify(updatedState)}\n`, { mode: 0o600 })
    await rename(temporaryPath, path)
  }
}
