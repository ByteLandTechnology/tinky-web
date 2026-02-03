[**tinky-web**](../README.md)

---

[tinky-web](../README.md) / TinkyHandle

# Interface: TinkyHandle

Handle exposing imperative methods for controlling the Tinky component

Use this interface with React's `useRef` and `useImperativeHandle` to
access the underlying terminal and Tinky instances.

## Example

```tsx
const tinkyRef = useRef<TinkyHandle>(null);

// Later, access the terminal:
const terminal = tinkyRef.current?.terminal;
const dimensions = tinkyRef.current?.dimensions;
const tinkyInstance = tinkyRef.current?.instance;
```

## Properties

### dimensions

> `readonly` **dimensions**: `ITerminalDimensions` \| `null`

Current dimensions of the terminal in columns and rows

Returns an object with `cols` and `rows` properties, or `null` if
the terminal hasn't been initialized yet.

---

### instance

> `readonly` **instance**: `Instance` \| `null`

The underlying Tinky Instance

Provides access to Tinky's render instance for operations like:

- `instance.rerender()`: Force a re-render
- `instance.unmount()`: Unmount the Tinky application
- `instance.waitUntilExit()`: Wait for the app to exit

---

### terminal

> `readonly` **terminal**: `Terminal` \| `null`

The underlying Xterm.js Terminal instance

Provides direct access to the terminal for advanced operations like:

- Custom escape sequence handling
- Terminal-level event listeners
- Programmatic writing to the terminal

#### Remarks

Be cautious when interacting with the terminal directly, as it may
interfere with Tinky's rendering. The terminal is initialized during
the first render, so this may be null before mount.
