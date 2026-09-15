# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single [Node-RED](http://nodered.org/) custom node package (`node-red-contrib-sum`) that sums incoming `msg.payload` values, keyed by `msg.topic`. It is modeled on `eisbehr/node-red-contrib-average`.

The entire package is two files that together define one Node-RED node:

- `sum.js` — the runtime node definition, registered with Node-RED via `RED.nodes.registerType("sum", sum)`. On each `input` event it either resets stored state (`msg.reset` truthy) or, for a numeric `msg.payload`, stores the value under `node.topics[msg.topic]` and emits the sum of all stored topic values as the new `msg.payload`.
- `sum.html` — the editor-side definition: the edit dialog template, the help text, and the `RED.nodes.registerType` call that registers the node's appearance/defaults (`name`, `topic`) in the Node-RED palette.

`package.json` wires `sum.js` up as a Node-RED node via the `node-red.nodes.sum` field — this is what makes Node-RED load it as a custom node when the package is installed.

There is no build step, bundler, or transpilation — both files are consumed by Node-RED directly.

## Development

There are no npm scripts (no build/lint/test defined in `package.json`), and no automated test suite in the repo. To manually verify a change, install the package into a local Node-RED user directory and exercise the node from the Node-RED editor/flow:

```
npm install <path-to-this-repo>
```

(run from `~/.node-red`, or wherever the target Node-RED user directory is), then restart Node-RED and add the "sum" node from the function category to a flow.

## Node behavior contract

- Only messages with a `payload` property are processed at all.
- `msg.reset` (truthy) takes priority: clears `node.topics`, sets `payload` to `0`, and forwards the message.
- Otherwise, `msg.payload` is coerced with `Number(...)`; non-numeric/non-finite values are logged (`node.log`) and the message is dropped rather than forwarded.
- Valid numeric input is stored per `msg.topic` (via `.toString()`), and `msg.payload` is replaced with the sum across all stored topics before the message is forwarded.
- If the node's `topic` config field is set, it overwrites `msg.topic` on output.
- All other message properties pass through unchanged.
