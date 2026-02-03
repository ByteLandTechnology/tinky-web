import { describe, expect, it, vi } from "vitest";
import { Terminal } from "@xterm/xterm";
import { TerminalReadableStream } from "../src/utils/streams";

const createContainer = () => {
  const container = document.createElement("div");
  container.style.width = "600px";
  container.style.height = "400px";
  document.body.appendChild(container);
  return container;
};

describe("TerminalReadableStream / Basic Input Handling", () => {
  it("buffers onData and emits readable", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);
    const readable = vi.fn();
    stdin.on("readable", readable);

    terminal.input("x", true);

    expect(readable).toHaveBeenCalledTimes(1);
    expect(stdin.read()).toBe("x");
    expect(stdin.read()).toBeNull();

    terminal.dispose();
    container.remove();
  });

  it("handles multiple data inputs", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);
    const readable = vi.fn();
    stdin.on("readable", readable);

    terminal.input("a", true);
    terminal.input("b", true);
    terminal.input("c", true);

    expect(readable).toHaveBeenCalledTimes(3);
    expect(stdin.read()).toBe("a");
    expect(stdin.read()).toBe("b");
    expect(stdin.read()).toBe("c");
    expect(stdin.read()).toBeNull();

    terminal.dispose();
    container.remove();
  });

  it("returns null when buffer is empty", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    expect(stdin.read()).toBeNull();
    expect(stdin.read()).toBeNull();

    terminal.dispose();
    container.remove();
  });
});

describe("TerminalReadableStream / Properties", () => {
  it("handles isTTY property", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    expect(stdin.isTTY).toBe(true);

    terminal.dispose();
    container.remove();
  });

  it("handles readable property", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    expect(stdin.readable).toBe(true);

    terminal.dispose();
    container.remove();
  });

  it("handles fd property", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    expect(stdin.fd).toBe(0);

    terminal.dispose();
    container.remove();
  });
});

describe("TerminalReadableStream / Raw Mode", () => {
  it("sets raw mode", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    expect(stdin.isRaw).toBe(true);

    const result = stdin.setRawMode(false);

    expect(stdin.isRaw).toBe(false);
    expect(result).toBe(stdin);

    terminal.dispose();
    container.remove();
  });
});

describe("TerminalReadableStream / No-op Methods", () => {
  it("sets encoding (no-op)", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    expect(() => stdin.setEncoding("utf-8")).not.toThrow();

    terminal.dispose();
    container.remove();
  });

  it("resumes stream (no-op)", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    const result = stdin.resume();

    expect(result).toBe(stdin);

    terminal.dispose();
    container.remove();
  });

  it("pauses stream (no-op)", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    const result = stdin.pause();

    expect(result).toBe(stdin);

    terminal.dispose();
    container.remove();
  });

  it("refs stream (no-op)", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    const result = stdin.ref();

    expect(result).toBe(stdin);

    terminal.dispose();
    container.remove();
  });

  it("unrefs stream (no-op)", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);

    expect(() => stdin.unref()).not.toThrow();

    terminal.dispose();
    container.remove();
  });
});

describe("TerminalReadableStream / Node Compatibility", () => {
  it("returns itself as Node ReadStream", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdin = new TerminalReadableStream(terminal);
    const nodeStream = stdin.asNodeReadStream();

    expect(nodeStream).toBe(stdin);

    terminal.dispose();
    container.remove();
  });
});
