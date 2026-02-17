/**
 * Custom stream implementations for Tinky Web
 *
 * This module provides custom stream classes that bridge between Tinky's stream
 * requirements and the browser-based Xterm.js terminal. These streams implement the
 * minimal subset of the Node.js stream API that Tinky requires to function.
 *
 * @remarks
 * Tinky expects Node.js-style `stdout`, `stderr`, and `stdin` streams with specific
 * properties and methods. Since these don't exist in the browser, we provide custom
 * implementations that:
 *
 * 1. **TerminalWritableStream**: Writes Tinky's ANSI output to Xterm.js
 * 2. **TerminalReadableStream**: Captures Xterm.js keyboard input for Tinky
 *
 * These streams extend EventEmitter to support the event-based API that Tinky uses
 * for resize notifications and input handling.
 *
 * @module utils/streams
 */

import { EventEmitter } from "tinky/lib/utils/event-emitter";
import type { ReadStream, WriteStream } from "tinky";
import type { Terminal } from "@xterm/xterm";

// ============================================================================
// TerminalWritableStream
// ============================================================================

/**
 * A custom Writable stream that bridges between Tinky's output and Xterm.js
 *
 * This class intercepts data written by Tinky (ANSI escape codes and text),
 * performs necessary transformations, and forwards them to the underlying
 * Xterm.js terminal instance.
 *
 * @remarks
 * Key responsibilities:
 *
 * 1. **Newline Conversion**: Converts standalone `\n` (LF) to `\r\n` (CRLF)
 *    because Xterm.js treats LF as just moving down, not returning to column 0.
 *
 * 2. **Dimension Tracking**: Maintains `columns` and `rows` properties that
 *    reflect the terminal's current size.
 *
 * 3. **Resize Events**: Emits 'resize' events when dimensions change, which
 *    Tinky listens to for re-layout.
 *
 * 4. **Cursor Manipulation**: Provides methods like `clearLine`, `cursorTo`,
 *    and `moveCursor` that Tinky may use for optimized rendering.
 *
 * @example
 * ```typescript
 * import { Terminal } from '@xterm/xterm';
 * import { TerminalWritableStream } from './streams';
 *
 * const term = new Terminal();
 * const stdout = new TerminalWritableStream(term);
 *
 * // Write text to the terminal
 * stdout.write('Hello, World!\n');
 *
 * // Listen for resize events
 * stdout.on('resize', () => {
 *   console.log(`New size: ${stdout.columns}x${stdout.rows}`);
 * });
 * ```
 *
 * @extends EventEmitter
 * @implements WriteStream
 */
export class TerminalWritableStream
  extends EventEmitter
  implements WriteStream
{
  /**
   * The underlying Xterm.js Terminal instance
   *
   * All write operations are forwarded to this terminal.
   *
   * @private
   */
  private term: Terminal;

  /**
   * Indicates if the stream is connected to a TTY
   *
   * Always `true` for this implementation since Xterm.js is a full
   * terminal emulator with TTY capabilities.
   *
   * @defaultValue true
   */
  public isTTY = true;

  /**
   * The number of columns in the terminal
   *
   * This value is synchronized with the Xterm.js terminal's `cols` property.
   * Tinky uses this for layout calculations.
   *
   * @remarks
   * Updated automatically when `updateDimensions()` is called, typically
   * in response to terminal resize events.
   */
  public columns: number;

  /**
   * Current number of rows in the terminal
   *
   * This value is synchronized with the Xterm.js terminal's `rows` property.
   * Tinky uses this for layout calculations.
   */
  public rows: number;

  /**
   * Indicates if the stream is currently writable
   *
   * Always `true` since the Xterm.js terminal is always ready to accept data.
   *
   * @defaultValue true
   */
  public writable = true;

  /**
   * Creates a new TerminalWritableStream
   *
   * @param term - The Xterm.js Terminal instance to write output to
   *
   * @example
   * ```typescript
   * const terminal = new Terminal();
   * const stdout = new TerminalWritableStream(terminal);
   * ```
   */
  constructor(term: Terminal) {
    // Initialize EventEmitter for 'resize' event support
    super();

    // Store reference to the terminal
    this.term = term;

    // Initialize dimensions from current terminal size
    this.columns = term.cols;
    this.rows = term.rows;
  }

  /**
   * Writes data to the terminal
   *
   * This is the primary method for outputting text and ANSI escape sequences
   * to the terminal. It handles newline normalization before forwarding
   * data to Xterm.js.
   *
   * @param chunk - The data to write (string or Uint8Array)
   * @param encodingOrCallback - Either the encoding string (ignored) or a callback
   * @param callback - Optional callback invoked after the write completes
   * @returns Always returns `true` indicating the stream is ready for more data
   *
   * @remarks
   * **Newline Handling**: Converts standalone `\n` to `\r\n` because Xterm.js
   * operates in a mode where LF only moves the cursor down without returning
   * to column 0. This conversion ensures proper line handling.
   *
   * The conversion uses a negative lookbehind `(?<!\r)` to only convert `\n`
   * that is NOT already preceded by `\r`, avoiding double conversion.
   *
   * @example
   * ```typescript
   * const stdout = new TerminalWritableStream(terminal);
   *
   * // Write with callback
   * stdout.write('Hello', () => console.log('Written!'));
   *
   * // Write with encoding (encoding is ignored)
   * stdout.write('World', 'utf-8');
   * ```
   */
  write(
    str: string,
    _encoding?: string,
    cb?: (err?: Error | null) => void,
  ): boolean {
    // Convert standalone LF to CRLF for proper line handling in Xterm.js
    // Uses negative lookbehind to avoid converting already-correct CRLF sequences
    // Pattern: (?<!\r)\n matches \n that is NOT preceded by \r
    const processedStr = str.replace(/(?<!\r)\n/g, "\r\n");

    // Write the processed string to the Xterm.js terminal
    this.term.write(processedStr);

    // Invoke callback if provided
    if (cb) cb();

    // Always return true (stream never applies backpressure)
    return true;
  }

  /**
   * Signals the end of writing to the stream
   *
   * Optionally writes a final chunk of data before ending.
   *
   * @param chunk - Optional final data to write
   * @param callback - Optional callback invoked after the final write
   * @returns The stream instance for chaining
   *
   * @remarks
   * Unlike Node.js streams, this method doesn't actually "end" anything
   * since the Xterm.js terminal continues to be usable. It's mainly
   * provided for API compatibility.
   */
  end(chunk?: string, callback?: () => void): this {
    // Write final chunk if provided
    if (chunk) {
      this.write(chunk, undefined, callback);
    }
    return this;
  }

  /**
   * Returns the current terminal window size
   *
   * @returns A tuple of [columns, rows]
   *
   * @remarks
   * This method is used by some Node.js APIs to query terminal dimensions.
   * Returns the same values as the `columns` and `rows` properties.
   */
  getWindowSize(): [number, number] {
    return [this.columns, this.rows];
  }

  /**
   * Clears the current line in a specific direction
   *
   * Uses ANSI escape sequences to clear portions of the current line.
   *
   * @param dir - Direction to clear:
   *              - `-1`: Clear from cursor to start of line (left)
   *              - `1`: Clear from cursor to end of line (right)
   *              - `0`: Clear entire line
   * @param callback - Optional callback invoked after the operation
   * @returns `true` indicating success
   *
   * @remarks
   * ANSI escape sequences used:
   * - `\x1b[1K` - Erase from cursor to beginning of line
   * - `\x1b[0K` - Erase from cursor to end of line
   * - `\x1b[2K` - Erase entire line
   */
  clearLine(dir: number, callback?: () => void): boolean {
    if (dir === -1) {
      // Clear from cursor to start of line (ESC [ 1 K)
      this.term.write("\x1b[1K");
    } else if (dir === 1) {
      // Clear from cursor to end of line (ESC [ 0 K)
      this.term.write("\x1b[0K");
    } else {
      // Clear entire line (ESC [ 2 K)
      this.term.write("\x1b[2K");
    }

    // Invoke callback if provided
    if (callback) callback();
    return true;
  }

  /**
   * Clears the screen from the cursor position down to the bottom
   *
   * Uses the ANSI escape sequence ESC [ J to erase from cursor to end of screen.
   *
   * @param callback - Optional callback invoked after the operation
   * @returns `true` indicating success
   *
   * @remarks
   * This is commonly used when Tinky needs to clear previously rendered
   * content before redrawing.
   */
  clearScreenDown(callback?: () => void): boolean {
    // ESC [ J - Erase from cursor to end of screen
    this.term.write("\x1b[J");

    if (callback) callback();
    return true;
  }

  /**
   * Moves the cursor to an absolute position
   *
   * Uses ANSI escape sequences to position the cursor at specific coordinates.
   *
   * @param x - The target column (0-indexed)
   * @param y - The target row (0-indexed), or a callback if only moving horizontally
   * @param callback - Optional callback invoked after the operation
   * @returns `true` indicating success
   *
   * @remarks
   * ANSI escape sequences use 1-based coordinates, so we add 1 to x and y.
   *
   * - If only `x` is provided: Uses ESC [ x+1 G to move to column
   * - If both `x` and `y` are provided: Uses ESC [ y+1 ; x+1 H to move to position
   *
   * @example
   * ```typescript
   * // Move to column 5 on current row
   * stdout.cursorTo(5);
   *
   * // Move to column 10, row 3
   * stdout.cursorTo(10, 3);
   * ```
   */
  cursorTo(
    x: number,
    y?: number | (() => void),
    callback?: () => void,
  ): boolean {
    // Handle overloaded signature: y might be the callback
    if (typeof y === "function") {
      callback = y;
      y = undefined;
    }

    if (y !== undefined) {
      // Move to absolute position (row, column)
      // ESC [ row ; col H (1-based coordinates)
      this.term.write(`\x1b[${y + 1};${x + 1}H`);
    } else {
      // Move to column on current row
      // ESC [ col G (1-based column)
      this.term.write(`\x1b[${x + 1}G`);
    }

    if (callback) callback();
    return true;
  }

  /**
   * Moves the cursor relative to its current position
   *
   * Uses ANSI escape sequences to move the cursor by a delta amount.
   *
   * @param dx - Horizontal movement (positive = right, negative = left)
   * @param dy - Vertical movement (positive = down, negative = up)
   * @param callback - Optional callback invoked after the operation
   * @returns `true` indicating success
   *
   * @remarks
   * ANSI escape sequences used:
   * - `ESC [ n C` - Move cursor right n columns
   * - `ESC [ n D` - Move cursor left n columns
   * - `ESC [ n B` - Move cursor down n rows
   * - `ESC [ n A` - Move cursor up n rows
   *
   * @example
   * ```typescript
   * // Move 5 columns right and 2 rows down
   * stdout.moveCursor(5, 2);
   *
   * // Move 3 columns left
   * stdout.moveCursor(-3, 0);
   * ```
   */
  moveCursor(dx: number, dy: number, callback?: () => void): boolean {
    // Move right (ESC [ n C)
    if (dx > 0) this.term.write(`\x1b[${dx}C`);

    // Move left (ESC [ n D)
    if (dx < 0) this.term.write(`\x1b[${-dx}D`);

    // Move down (ESC [ n B)
    if (dy > 0) this.term.write(`\x1b[${dy}B`);

    // Move up (ESC [ n A)
    if (dy < 0) this.term.write(`\x1b[${-dy}A`);

    if (callback) callback();
    return true;
  }

  /**
   * Updates the internal dimensions to match the terminal's actual size
   *
   * This method should be called whenever the Xterm.js terminal is resized.
   * It updates the `columns` and `rows` properties and emits a 'resize' event
   * that Tinky listens to for triggering re-layout.
   *
   * @remarks
   * This is typically called from TinkyCanvas's terminal resize event handler.
   * The 'resize' event is crucial for Tinky to know when to recalculate its
   * layout to fit the new terminal dimensions.
   *
   * @example
   * ```typescript
   * terminal.onResize((size) => {
   *   stdout.updateDimensions();
   *   // Now stdout.columns and stdout.rows reflect the new size
   * });
   * ```
   *
   * @fires resize - Emitted after dimensions are updated
   */
  updateDimensions(): void {
    // Sync dimensions from the terminal
    this.columns = this.term.cols;
    this.rows = this.term.rows;

    // Emit 'resize' event to notify Tinky of dimension change
    this.emit("resize");
  }

  /**
   * Returns this stream typed as NodeJS.WriteStream for use with Tinky's render()
   *
   * This method casts the current instance (which implements a subset of WriteStream)
   * to the full `NodeJS.WriteStream` type required by TypeScript definitions.
   *
   * @returns The stream cast as `NodeJS.WriteStream`
   *
   * @remarks
   * This cast is safe because Tinky only relies on the methods we have implemented.
   * It allows us to pass this stream to `render()` without TypeScript errors.
   *
   * @example
   * ```typescript
   * import { render } from 'tinky';
   *
   * const stdout = new TerminalWritableStream(terminal);
   *
   * render(<App />, {
   *   stdout,
   *   // ...
   * });
   * ```
   */
}

// ============================================================================
// TerminalReadableStream
// ============================================================================

/**
 * A custom Readable stream that bridges between Xterm.js input and Tinky
 *
 * This class captures user keyboard input from Xterm.js's `onData` event,
 * and forwards it to Tinky through Node.js-style `data` events.
 *
 * @remarks
 * Key features:
 *
 * 1. **Event-Based**: Emits `data` events when new data arrives, which
 *    Tinky listens to for input processing.
 *
 * 3. **Raw Mode Support**: Provides `setRawMode()` for API compatibility,
 *    though Xterm.js effectively always operates in raw mode.
 *
 * @example
 * ```typescript
 * import { Terminal } from '@xterm/xterm';
 * import { TerminalReadableStream } from './streams';
 *
 * const term = new Terminal();
 * const stdin = new TerminalReadableStream(term);
 *
 * // Listen for input chunks
 * stdin.on('data', (data) => {
 *   console.log('Received:', data);
 * });
 * ```
 *
 * @extends EventEmitter
 * @implements ReadStream
 */
export class TerminalReadableStream extends EventEmitter implements ReadStream {
  /**
   * Indicates if the stream is connected to a TTY
   *
   * Always `true` for this implementation, enabling raw mode support.
   *
   * @defaultValue true
   */
  public isTTY = true;

  /**
   * Indicates if the stream is currently in raw mode
   *
   * Set via `setRawMode()`. In raw mode, input is available character-by-character
   * rather than line-by-line.
   *
   * @defaultValue true
   *
   * @remarks
   * Xterm.js effectively always operates in raw mode, providing individual
   * keypresses immediately. This flag is mainly for API compatibility.
   */
  public isRaw = true;

  /**
   * Indicates if the stream is currently readable
   *
   * Always `true` since the stream is always ready to accept input from Xterm.js.
   *
   * @defaultValue true
   */
  public readable = true;

  /**
   * The file descriptor for the stream
   *
   * Set to 0 (standard input) for API compatibility.
   *
   * @defaultValue 0
   */
  public fd = 0;

  /**
   * The underlying Xterm.js Terminal instance
   *
   * Input events from this terminal are captured and emitted.
   *
   * @private
   */
  private term: Terminal;

  /**
   * Creates a new TerminalReadableStream
   *
   * Sets up the Xterm.js data handler to capture keyboard input.
   *
   * @param term - The Xterm.js Terminal instance to read input from
   *
   * @example
   * ```typescript
   * const terminal = new Terminal();
   * terminal.open(containerElement);
   *
   * const stdin = new TerminalReadableStream(terminal);
   * ```
   */
  constructor(term: Terminal) {
    // Initialize EventEmitter for stdin event support
    super();

    // Store reference to the terminal
    this.term = term;

    // Set up Xterm.js data handler.
    // The onData event fires whenever the user types or pastes text.
    // Tinky consumes `data` events from stdin.
    this.term.onData((data: string) => {
      // Emit 'data' for Tinky's stdin handling.
      this.emit("data", data);
    });
  }

  /**
   * Reads data from the stream.
   *
   * @param _size - Number of bytes to read (ignored; we return one chunk per call)
   * @returns Always `null` in this implementation.
   *
   * @remarks
   * This method is kept only for API compatibility. Input delivery is event-based
   * and happens through `data` events.
   */
  read(_size?: number): string | null {
    // Consume _size to satisfy no-unused-vars (Node.js API compatibility).
    void _size;
    return null;
  }

  /**
   * Sets the stream's raw mode
   *
   * Controls whether input is available character-by-character (raw mode)
   * or line-by-line (cooked mode).
   *
   * @param mode - `true` to enable raw mode, `false` for cooked mode
   * @returns The stream instance for chaining
   *
   * @remarks
   * In browser environments with Xterm.js, input is effectively always "raw"
   * since keystrokes are captured individually. Tinky sets this to `true` to
   * indicate it expects character-by-character input.
   *
   * This method mainly exists for API compatibility with Node.js streams.
   */
  setRawMode(mode: boolean): this {
    this.isRaw = mode;
    return this;
  }

  /**
   * Sets the encoding for the stream
   *
   * @param _encoding - The encoding to use (e.g., 'utf-8')
   *
   * @remarks
   * This is a no-op in our implementation since Xterm.js already handles
   * strings as UTF-16 internally and provides string data to our handler.
   */
  setEncoding(_encoding: string): void {
    // Consume _encoding to satisfy no-unused-vars (Node.js API compatibility)
    void _encoding;
    // No-op - Xterm.js already handles string encoding
  }

  /**
   * Resumes the paused stream
   *
   * @returns The stream instance for chaining
   *
   * @remarks
   * This is a no-op for this implementation. The stream cannot be paused
   * since Xterm.js doesn't support pausing input events.
   */
  resume(): this {
    return this;
  }

  /**
   * Pauses the stream
   *
   * @returns The stream instance for chaining
   *
   * @remarks
   * This is a no-op for this implementation. The stream cannot be paused
   * since Xterm.js doesn't support pausing input events.
   */
  pause(): this {
    return this;
  }

  /**
   * Keeps the Node.js event loop active
   *
   * @returns The stream instance for chaining
   *
   * @remarks
   * This is a no-op in the browser. In Node.js, this would prevent the
   * process from exiting while the stream is open. Since there's no
   * Node.js event loop in the browser, this method does nothing.
   */
  ref(): this {
    return this;
  }

  /**
   * Allows the Node.js event loop to exit
   *
   * @remarks
   * This is a no-op in the browser. In Node.js, this would allow the
   * process to exit even if the stream is open.
   */
  unref(): void {
    // No-op
  }

  /**
   * Returns this stream typed as NodeJS.ReadStream for use with Tinky's render()
   *
   * This method casts the current instance (which implements a subset of ReadStream)
   * to the full `NodeJS.ReadStream` type required by TypeScript definitions.
   *
   * @returns The stream cast as `NodeJS.ReadStream`
   *
   * @remarks
   * This cast is safe because Tinky only relies on the methods we have implemented.
   * It allows us to pass this stream to `render()` without TypeScript errors.
   *
   * @example
   * ```typescript
   * import { render } from 'tinky';
   *
   * const stdin = new TerminalReadableStream(terminal);
   *
   * render(<App />, {
   *   stdin,
   *   // ...
   * });
   * ```
   */
}
