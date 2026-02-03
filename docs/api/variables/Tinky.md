[**tinky-web**](../README.md)

---

[tinky-web](../README.md) / Tinky

# Variable: Tinky

> `const` **Tinky**: `ForwardRefExoticComponent`\<[`TinkyProps`](../interfaces/TinkyProps.md) & `RefAttributes`\<[`TinkyHandle`](../interfaces/TinkyHandle.md)\>\>

Tinky - A React component that bridges Tinky applications with the browser using Xterm.js

This component initializes an Xterm.js terminal in the browser and creates custom
streams (`stdout`, `stderr`, `stdin`) to pipe output from a Tinky
application into the terminal and input from the terminal back to Tinky.

## Remarks

**Features:**

- Auto-fitting to container size (can be disabled with fixed `cols`/`rows`)
- Keyboard input handling via `focused` prop
- Customizable terminal appearance via `terminalOptions`
- Resize callback for tracking dimension changes
- Imperative handle for accessing terminal and Tinky instances

**Lifecycle:**

1. On mount: Creates Terminal, FitAddon, streams, and Tinky instance
2. Attaches resize observer for auto-fitting (if not using fixed dimensions)
3. Re-renders Tinky children wrapped in Canvas when children change
4. On unmount: Disposes terminal and cleans up Tinky instance

**Important Notes:**

- The container div must have explicit dimensions (via style or CSS) for
  auto-fitting to work correctly
- The component uses `forwardRef` to expose [TinkyHandle](../interfaces/TinkyHandle.md)
- Terminal options changes are applied reactively via useEffect

## Example

Full-featured example:

```tsx
import { Tinky, TinkyHandle } from "tinky-web";
import { useRef, useState } from "react";

function App() {
  const tinkyRef = useRef<TinkyHandle>(null);
  const [focused, setFocused] = useState(false);

  return (
    <Tinky
      ref={tinkyRef}
      focused={focused}
      onClick={() => setFocused(true)}
      terminalOptions={{
        fontSize: 16,
        theme: { background: "#282c34" },
      }}
      onResize={(dims) => console.log("Resized:", dims)}
      style={{ width: "100%", height: "100vh" }}
    >
      <MyTinkyApp />
    </Tinky>
  );
}
```
