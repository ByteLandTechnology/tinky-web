import { describe, expect, it, vi } from "vitest";
import { Terminal } from "@xterm/xterm";
import { TerminalWritableStream } from "../src/utils/streams";

const createContainer = () => {
  const container = document.createElement("div");
  container.style.width = "600px";
  container.style.height = "400px";
  document.body.appendChild(container);
  return container;
};

describe("TerminalWritableStream / Dimension Management", () => {
  describe("updateDimensions", () => {
    it("emits resize event when updateDimensions is called", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);
      terminal.resize(100, 50);

      const stdout = new TerminalWritableStream(terminal);
      const resizeHandler = vi.fn();

      stdout.on("resize", resizeHandler);
      stdout.updateDimensions();

      expect(resizeHandler).toHaveBeenCalled();
      expect(stdout.columns).toBe(100);
      expect(stdout.rows).toBe(50);

      terminal.dispose();
      container.remove();
    });

    it("updates dimensions after terminal resize", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);
      terminal.resize(80, 24);

      const stdout = new TerminalWritableStream(terminal);

      expect(stdout.columns).toBe(80);
      expect(stdout.rows).toBe(24);

      terminal.resize(120, 40);
      stdout.updateDimensions();

      expect(stdout.columns).toBe(120);
      expect(stdout.rows).toBe(40);

      terminal.dispose();
      container.remove();
    });
  });

  describe("getWindowSize", () => {
    it("returns window size from getWindowSize", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);
      terminal.resize(80, 24);

      const stdout = new TerminalWritableStream(terminal);

      const [cols, rows] = stdout.getWindowSize();

      expect(cols).toBe(80);
      expect(rows).toBe(24);

      terminal.dispose();
      container.remove();
    });

    it("returns consistent values with properties", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);
      terminal.resize(100, 30);

      const stdout = new TerminalWritableStream(terminal);
      const [cols, rows] = stdout.getWindowSize();

      expect(cols).toBe(stdout.columns);
      expect(rows).toBe(stdout.rows);

      terminal.dispose();
      container.remove();
    });
  });

  describe("Initialization", () => {
    it("initializes with correct dimensions from terminal", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);
      terminal.resize(100, 40);

      const stdout = new TerminalWritableStream(terminal);

      expect(stdout.columns).toBe(100);
      expect(stdout.rows).toBe(40);

      terminal.dispose();
      container.remove();
    });

    it("handles default terminal dimensions", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const stdout = new TerminalWritableStream(terminal);

      expect(stdout.columns).toBeGreaterThan(0);
      expect(stdout.rows).toBeGreaterThan(0);

      terminal.dispose();
      container.remove();
    });
  });
});
