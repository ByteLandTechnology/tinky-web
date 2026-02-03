[**tinky-web**](../README.md)

---

[tinky-web](../README.md) / Canvas

# Function: Canvas()

> **Canvas**(`props`): `Element`

A root component that automatically sizes itself to match stdout dimensions

Use this as the top-level container for your Tinky application to ensure it
fills the entire terminal viewport. The component automatically responds
to terminal resize events and updates its dimensions accordingly.

## Parameters

### props

`object` & `object` & `object` & `RefAttributes`\<`DOMElement`\>

Standard Tinky Box props passed to the underlying container

## Returns

`Element`

A Box component sized to match the terminal dimensions

## Remarks

This component is used internally by TinkyCanvas to wrap user-provided children.
It ensures that the Tinky application's layout calculations use the full terminal
dimensions, enabling proper scrolling and layout behavior.

**How it works:**

1. Uses `useStdout` hook to access the stdout stream
2. Initializes state with current stdout dimensions
3. Sets up a resize event listener to track dimension changes
4. Renders a Box with width/height matching the terminal size

## Examples

Basic usage within a Tinky application:

```tsx
import { Canvas } from "tinky-web";
import { Text } from "tinky";

const App = () => (
  <Canvas>
    <Text>This will fill the entire terminal!</Text>
  </Canvas>
);
```

With custom styling (note: width/height will be overridden):

```tsx
<Canvas flexDirection="column" justifyContent="center">
  <Text>Vertically centered content</Text>
</Canvas>
```
