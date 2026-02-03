/**
 * Canvas Component
 *
 * A root container component that automatically sizes itself to match the stdout dimensions.
 * This component listens to resize events from the stdout stream and updates its dimensions
 * accordingly, ensuring the Tinky application always fills the available terminal space.
 *
 * @remarks
 * In a typical terminal environment, the stdout stream provides `columns` and `rows` properties
 * indicating the terminal dimensions. This component uses those values to set the width and height
 * of its Box container.
 *
 * When used with Tinky, the stdout stream is the custom {@link TerminalWritableStream} which
 * emits 'resize' events whenever the Xterm.js terminal dimensions change.
 *
 * @module components/Canvas
 */

import React from "react";
import { Box, useStdout } from "tinky";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props for the Canvas component
 *
 * Extends all props from Tinky's Box component, allowing full customization
 * of the container's styling and layout properties.
 *
 * @remarks
 * While you can pass custom `width` and `height` props, the Canvas component
 * will override them with the current stdout dimensions. If you need a fixed-size
 * container, use a regular Box instead.
 */
export type CanvasProps = React.ComponentProps<typeof Box>;

// ============================================================================
// Canvas Component
// ============================================================================

/**
 * A root component that automatically sizes itself to match stdout dimensions
 *
 * Use this as the top-level container for your Tinky application to ensure it
 * fills the entire terminal viewport. The component automatically responds
 * to terminal resize events and updates its dimensions accordingly.
 *
 * @param props - Standard Tinky Box props passed to the underlying container
 * @returns A Box component sized to match the terminal dimensions
 *
 * @remarks
 * This component is used internally by TinkyCanvas to wrap user-provided children.
 * It ensures that the Tinky application's layout calculations use the full terminal
 * dimensions, enabling proper scrolling and layout behavior.
 *
 * **How it works:**
 * 1. Uses `useStdout` hook to access the stdout stream
 * 2. Initializes state with current stdout dimensions
 * 3. Sets up a resize event listener to track dimension changes
 * 4. Renders a Box with width/height matching the terminal size
 *
 * @example
 * Basic usage within a Tinky application:
 * ```tsx
 * import { Canvas } from 'tinky-web';
 * import { Text } from 'tinky';
 *
 * const App = () => (
 *   <Canvas>
 *     <Text>This will fill the entire terminal!</Text>
 *   </Canvas>
 * );
 * ```
 *
 * @example
 * With custom styling (note: width/height will be overridden):
 * ```tsx
 * <Canvas flexDirection="column" justifyContent="center">
 *   <Text>Vertically centered content</Text>
 * </Canvas>
 * ```
 */
export const Canvas = (props: CanvasProps) => {
  // For server-side rendering, return a fixed-size Box
  if (typeof window === "undefined") {
    return <Box {...props} width={80} height={24} />;
  }

  // For client-side rendering, use the original implementation
  try {
    const { stdout } = useStdout();

    // Type guard to ensure stdout has columns and rows
    const hasValidDimensions = (
      stdout: unknown,
    ): stdout is {
      columns: number;
      rows: number;
      on?: (event: string, handler: () => void) => void;
      off?: (event: string, handler: () => void) => void;
    } => {
      if (typeof stdout !== "object" || stdout === null) {
        return false;
      }
      const s = stdout as { columns?: unknown; rows?: unknown };
      return typeof s.columns === "number" && typeof s.rows === "number";
    };

    if (!hasValidDimensions(stdout)) {
      return <Box {...props} width={80} height={24} />;
    }

    const [size, setSize] = React.useState({
      columns: stdout.columns,
      rows: stdout.rows,
    });

    React.useEffect(() => {
      const onResize = () => {
        setSize({
          columns: stdout.columns,
          rows: stdout.rows,
        });
      };

      if (stdout.on) {
        stdout.on("resize", onResize);
      }

      return () => {
        if (stdout.off) {
          stdout.off("resize", onResize);
        }
      };
    }, [stdout]);

    return <Box {...props} width={size.columns} height={size.rows} />;
  } catch {
    // If useStdout fails, return a fixed-size Box
    return <Box {...props} width={80} height={24} />;
  }
};
