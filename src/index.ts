/**
 * @packageDocumentation
 *
 * Race an event against an AbortSignal, taking care to remove any event
 * listeners that were added.
 *
 * @example
 *
 * ```TypeScript
 * const { raceEvent } = require('race-event')
 *
 * const controller = new AbortController()
 * const emitter = new EventTarget()
 *
 * setTimeout(() => {
 *   controller.abort()
 * }, 500)
 *
 * setTimeout(() => {
 *   // too late
 *   emitter.dispatchEvent(new CustomEvent('event'))
 * }, 1000)
 *
 * // throws an AbortError
 * const resolve = await raceEvent(emitter, 'event', controller.signal)
 * ```
 */

/**
 * An abort error class that extends error
 */
export class AbortError extends Error {
  public type: string
  public code: string | string

  constructor (message?: string, code?: string) {
    super(message ?? 'The operation was aborted')
    this.type = 'aborted'
    this.name = 'AbortError'
    this.code = code ?? 'ABORT_ERR'
  }
}

export interface RaceEventOptions {
  /**
   * The message for the error thrown if the signal aborts
   */
  errorMessage?: string

  /**
   * The code for the error thrown if the signal aborts
   */
  errorCode?: string
}

/**
 * Race a promise against an abort signal
 */
export async function raceEvent <T> (emitter: EventTarget, eventName: string, signal?: AbortSignal, opts?: RaceEventOptions): Promise<T> {
  // create the error here so we have more context in the stack trace
  const error = new AbortError(opts?.errorMessage, opts?.errorCode)

  if (signal?.aborted === true) {
    return Promise.reject(error)
  }

  return new Promise((resolve, reject) => {
    const eventListener = (evt: any): void => {
      emitter.removeEventListener(eventName, eventListener)
      signal?.removeEventListener('abort', abortListener)

      resolve(evt)
    }
    const abortListener = (): void => {
      emitter.removeEventListener(eventName, eventListener)
      signal?.removeEventListener('abort', abortListener)

      reject(error)
    }

    emitter.addEventListener(eventName, eventListener)
    signal?.addEventListener('abort', abortListener)
  })
}
