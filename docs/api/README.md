**tinky-web**

---

# tinky-web

Tinky Web - A library for rendering Tinky applications in the browser using Xterm.js

This package provides the [Tinky](variables/Tinky.md) component, which acts as a bridge between
Tinky's rendering model and browser-based Xterm.js terminals.

## Remarks

Tinky is a React framework for building command-line interfaces. This library
enables it to run in the browser through Xterm.js integration.

## Example

Basic usage example:

```tsx
import { Tinky } from "tinky-web";
import { Text, Box } from "tinky";

const MyApp = () => (
  <Box borderStyle="round">
    <Text>Hello from Tinky in the Browser!</Text>
  </Box>
);

function App() {
  return (
    <Tinky focused>
      <MyApp />
    </Tinky>
  );
}
```

## Interfaces

- [TinkyHandle](interfaces/TinkyHandle.md)
- [TinkyProps](interfaces/TinkyProps.md)

## Type Aliases

- [CanvasProps](type-aliases/CanvasProps.md)

## Variables

- [Tinky](variables/Tinky.md)

## Functions

- [Canvas](functions/Canvas.md)
