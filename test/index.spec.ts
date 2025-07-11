/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { raceEvent } from '../src/index.js'

describe('race-event (EventTarget)', () => {
  let emitter: EventTarget
  let eventName: string
  let event: CustomEvent

  beforeEach(() => {
    emitter = new EventTarget()
    eventName = 'event'
    event = new CustomEvent(eventName)
  })

  it('should resolve value when no signal passed', async () => {
    queueMicrotask(() => {
      emitter.dispatchEvent(event)
    })

    await expect(raceEvent(emitter, eventName)).to.eventually.equal(event)
  })

  it('should abort when aborted signal passed', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(raceEvent(emitter, eventName, controller.signal)).to.eventually.be.rejected().with.property('name', 'AbortError')
  })

  it('should have default error fields', async () => {
    const controller = new AbortController()
    controller.abort()

    const err = await raceEvent(emitter, eventName, controller.signal).catch(err => err)

    expect(err).to.have.property('name', 'AbortError')
  })

  it('should have override error fields', async () => {
    const controller = new AbortController()
    controller.abort()

    const err = await raceEvent(emitter, eventName, controller.signal, {
      errorMessage: 'oh noes!',
      errorCode: 'OH_NOES'
    }).catch(err => err)

    expect(err).to.have.property('message', 'oh noes!')
    expect(err).to.have.property('name', 'AbortError')
    expect(err).to.have.property('code', 'OH_NOES')
  })

  it('should abort after a delay', async () => {
    setTimeout(() => {
      emitter.dispatchEvent(event)
    }, 1000)

    const controller = new AbortController()
    setTimeout(() => {
      controller.abort()
    }, 100)

    await expect(raceEvent(emitter, eventName, controller.signal)).to.eventually.be.rejected().with.property('name', 'AbortError')
  })

  it('should resolve after a delay', async () => {
    setTimeout(() => {
      emitter.dispatchEvent(event)
    }, 100)

    const controller = new AbortController()
    setTimeout(() => {
      controller.abort()
    }, 1000)

    await expect(raceEvent(emitter, eventName, controller.signal)).to.eventually.equal(event)
  })

  it('should filter events', async () => {
    const otherEvent = new CustomEvent(eventName, { detail: 'hello' })
    const controller = new AbortController()

    setTimeout(() => {
      emitter.dispatchEvent(event)
      emitter.dispatchEvent(otherEvent)
    }, 10)

    await expect(raceEvent<CustomEvent<string>>(emitter, eventName, controller.signal, {
      filter: (evt) => {
        return evt.detail === 'hello'
      }
    })).to.eventually.equal(otherEvent)
  })

  it('should reject if the filter throws', async () => {
    const err = new Error('Urk!')
    const controller = new AbortController()

    setTimeout(() => {
      emitter.dispatchEvent(event)
    }, 10)

    await expect(raceEvent<CustomEvent<string>>(emitter, eventName, controller.signal, {
      filter: () => {
        throw err
      }
    })).to.eventually.be.rejectedWith(err)
  })

  it('should reject via an error event', async () => {
    const err = new Error('Urk!')
    const controller = new AbortController()

    setTimeout(() => {
      emitter.dispatchEvent(new CustomEvent<Error>('error', {
        detail: err
      }))
    }, 10)

    await expect(raceEvent<CustomEvent<string>>(emitter, eventName, controller.signal))
      .to.eventually.be.rejectedWith(err)
  })

  it('should reject via an custom error event', async () => {
    const err = new Error('Urk!')
    const controller = new AbortController()

    setTimeout(() => {
      emitter.dispatchEvent(new CustomEvent<Error>('custom-error', {
        detail: err
      }))
    }, 10)

    await expect(raceEvent<CustomEvent<string>>(emitter, eventName, controller.signal, {
      errorEvent: 'custom-error'
    })).to.eventually.be.rejectedWith(err)
  })
})
