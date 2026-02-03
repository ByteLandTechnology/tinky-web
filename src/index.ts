/**
 * Tinky Web - A library for rendering Tinky applications in the browser using Xterm.js
 *
 * This package provides the {@link Tinky} component, which acts as a bridge between
 * Tinky's rendering model and browser-based Xterm.js terminals.
 *
 * @remarks
 * Tinky is a React framework for building command-line interfaces. This library
 * enables it to run in the browser through Xterm.js integration.
 *
 * @example
 * Basic usage example:
 * ```tsx
 * import { Tinky } from 'tinky-web';
 * import { Text, Box } from 'tinky';
 *
 * const MyApp = () => (
 *   <Box borderStyle="round">
 *     <Text>Hello from Tinky in the Browser!</Text>
 *   </Box>
 * );
 *
 * function App() {
 *   return (
 *     <Tinky focused>
 *       <MyApp />
 *     </Tinky>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Main Component Exports
// ============================================================================

/**
 * Export the Tinky component
 *
 * Tinky is the core component of this library, responsible for:
 * - Initializing and managing the Xterm.js terminal instance
 * - Creating custom stream implementations
 * - Rendering Tinky application output to the terminal
 * - Handling user keyboard input
 *
 * @see {@link Tinky} for detailed component documentation
 */
export { Tinky } from "./components/Tinky";

/**
 * Export the Canvas component
 *
 * Canvas is a root container component for Tinky applications that automatically
 * fits its size to the stdout dimensions. It listens to `stdout.on('resize')`
 * events and dynamically updates its width and height.
 *
 * @see {@link Canvas} for detailed component documentation
 */
export { Canvas } from "./components/Canvas";

/**
 * Export type definitions for the Tinky component
 *
 * - {@link TinkyProps}: Component props interface defining all configurable options
 * - {@link TinkyHandle}: Component ref handle interface for imperative control
 */
export type { TinkyProps, TinkyHandle } from "./components/Tinky";

/**
 * Export type definitions for the Canvas component
 *
 * - {@link CanvasProps}: Component props interface (extends Tinky's Box props)
 */
export type { CanvasProps } from "./components/Canvas";
