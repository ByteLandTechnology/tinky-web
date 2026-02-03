# tinky-web

A library for rendering [Tinky](https://github.com/ByteLandTechnology/tinky) applications in the browser using [Xterm.js](https://xtermjs.org/).

`tinky-web` bridges the gap between Tinky's rendering model and web-based terminal emulators. It provides custom stream implementations that allow Tinky to render directly into an Xterm.js instance running in a React application.

![License](https://img.shields.io/npm/l/tinky-web)
![Version](https://img.shields.io/npm/v/tinky-web)

## Features

- 🖥️ **Browser Compatibility**: Run Tinky applications entirely in the browser
- 🎨 **Xterm.js Integration**: Leverages the power and styling of Xterm.js
- 📐 **Auto Resizing**: Automatically handles terminal resizing and layout fitting
- ⌨️ **Input Handling**: Captures keyboard input from the browser and forwards it to Tinky
- 🌊 **Custom Streams**: Built-in `stdout`, `stderr`, and `stdin` streams optimized for the browser
- ⚡ **Lightweight**: Optimized for modern browser environments

## Installation

Install `tinky-web` and its peer dependencies:

```bash
# npm
npm install tinky-web

# yarn
yarn add tinky-web

# pnpm
pnpm add tinky-web
```

## Quick Start

Here's a simple example to get you started:

```tsx
import React, { useState } from "react";
import { Text, Box } from "tinky";
import { Tinky } from "tinky-web";

// Your Tinky application component
const MyTinkyApp = () => (
  <Box borderStyle="round" borderColor="green">
    <Text>Hello from Tinky in the Browser! 👋</Text>
  </Box>
);

// Main React component
const App = () => {
  const [focused, setFocused] = useState(true);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Tinky
        focused={focused}
        terminalOptions={{
          fontSize: 14,
          theme: { background: "#1a1b26" },
        }}
        onClick={() => setFocused(true)}
      >
        <MyTinkyApp />
      </Tinky>
    </div>
  );
};

export default App;
```

## API Reference

### Tinky Component

The main component that wraps your Tinky application.

```tsx
import { Tinky } from "tinky-web";
```

#### Props

| Prop              | Type                                             | Default     | Description                                         |
| ----------------- | ------------------------------------------------ | ----------- | --------------------------------------------------- |
| `children`        | `ReactNode`                                      | -           | The Tinky application to render                     |
| `focused`         | `boolean`                                        | `false`     | Whether the terminal captures keyboard input        |
| `cols`            | `number`                                         | `undefined` | Fixed number of columns. If omitted, fits container |
| `rows`            | `number`                                         | `undefined` | Fixed number of rows. If omitted, fits container    |
| `terminalOptions` | `ITerminalOptions`                               | `{}`        | Configuration for the Xterm.js instance             |
| `onResize`        | `(dims: { cols: number, rows: number }) => void` | -           | Callback fired when terminal dimensions change      |
| `...divProps`     | `HTMLAttributes<HTMLDivElement>`                 | -           | All other props are passed to the container `div`   |

#### Terminal Options

The `terminalOptions` prop accepts all [Xterm.js ITerminalOptions](https://xtermjs.org/docs/api/terminal/interfaces/iterminaloptions/) except `disableStdin`. Common options include:

```tsx
<Tinky
  terminalOptions={{
    // Font settings
    fontSize: 16,
    fontFamily: "JetBrains Mono, Fira Code, monospace",
    fontWeight: "normal",
    fontWeightBold: "bold",

    // Cursor settings
    cursorStyle: "bar", // 'block' | 'underline' | 'bar'
    cursorBlink: true,

    // Theme (colors)
    theme: {
      background: "#1a1b26",
      foreground: "#a9b1d6",
      cursor: "#c0caf5",
      selectionBackground: "#33467c",
      black: "#15161e",
      red: "#f7768e",
      green: "#9ece6a",
      yellow: "#e0af68",
      blue: "#7aa2f7",
      magenta: "#bb9af7",
      cyan: "#7dcfff",
      white: "#a9b1d6",
    },

    // Scollback
    scrollback: 1000,
  }}
>
  <MyApp />
</Tinky>
```

### TinkyHandle

Access the underlying terminal instance using a ref:

```tsx
import { useRef } from "react";
import { Tinky, TinkyHandle } from "tinky-web";

const App = () => {
  const tinkyRef = useRef<TinkyHandle>(null);

  const handleClick = () => {
    // Access the Xterm.js terminal
    const terminal = tinkyRef.current?.terminal;

    // Get current dimensions
    const dimensions = tinkyRef.current?.dimensions;
    console.log(`${dimensions?.cols}x${dimensions?.rows}`);

    // Access the Tinky instance
    const tinkyInstance = tinkyRef.current?.instance;
  };

  return (
    <Tinky ref={tinkyRef}>
      <MyApp />
    </Tinky>
  );
};
```

| Property     | Type                          | Description                               |
| ------------ | ----------------------------- | ----------------------------------------- |
| `terminal`   | `Terminal \| null`            | The Xterm.js Terminal instance            |
| `dimensions` | `ITerminalDimensions \| null` | Current terminal columns and rows         |
| `instance`   | `Instance \| null`            | The Tinky instance returned by `render()` |

## How It Works

Tinky is designed to be browser-friendly. `tinky-web` provides:

### 1. Custom Streams

It creates specialized `Runtime` streams that:

- **Stdout/Stderr**: Accept ANSI escape codes from Tinky and render them to the Xterm.js instance. They handle newline conversions (`\n` -> `\r\n`) and provide necessary TTY methods.
- **Stdin**: Captures input from the Xterm.js instance and pipes it back to Tinky.

### 2. React Integration

The `Tinky` component manages the lifecycle of:

- The Xterm.js terminal
- The Tinky render instance
- Resize observers to keep the terminal perfectly fitted to its container

## Troubleshooting

### Terminal appears empty or very small

Make sure the container element has explicit dimensions. The `Tinky` component fills the width and height of its parent (or the style you pass to it).

```tsx
// ✅ Correct - explicit dimensions
<Tinky style={{ width: "100%", height: "400px" }}>
  <MyApp />
</Tinky>
```

### Keyboard input not working

Ensure the `focused` prop is set to `true`. You usually want to manage this state in your parent component.

```tsx
<Tinky focused={true}>
  <MyApp />
</Tinky>
```

## License

MIT
