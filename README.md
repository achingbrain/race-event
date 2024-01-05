# race-event <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/github/achingbrain/race-event.svg?style=flat-square)](https://codecov.io/gh/achingbrain/race-event)
[![CI](https://img.shields.io/github/actions/workflow/status/achingbrain/race-event/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/achingbrain/race-event/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> Race an event against an AbortSignal

# About

Race an event against an AbortSignal, taking care to remove any event
listeners that were added.

## Example

```TypeScript
const { raceEvent } = require('race-event')

const controller = new AbortController()
const emitter = new EventTarget()

setTimeout(() => {
  controller.abort()
}, 500)

setTimeout(() => {
  // too late
  emitter.dispatchEvent(new CustomEvent('event'))
}, 1000)

// throws an AbortError
const resolve = await raceEvent(emitter, 'event', controller.signal)
```

# Install

```console
$ npm i race-event
```

## Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `RaceEvent` in the global namespace.

```html
<script src="https://unpkg.com/race-event/dist/index.min.js"></script>
```

# API Docs

- <https://achingbrain.github.io/race-event>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
