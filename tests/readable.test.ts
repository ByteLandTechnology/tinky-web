import { describe, expect, it, vi } from "vitest";
import { Terminal } from "@xterm/xterm";
import { TerminalReadableStream } from "../src/utils/streams";

const createContainer = () => {
  const node = document.createElement("div");
  node.style.width = "600px";
  node.style.height = "400px";
  document.body.appendChild(node);
  return node;
};

describe("TerminalReadableStream / Input Handling", () => {
  it("emits data on terminal input", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);
    const data = vi.fn();
    stdin.on("data", data);

    term.input("x", true);

    expect(data).toHaveBeenCalledTimes(1);
    expect(data).toHaveBeenCalledWith("x");

    term.dispose();
    node.remove();
  });

  it("emits data for multiple inputs", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);
    const data = vi.fn();
    stdin.on("data", data);

    term.input("a", true);
    term.input("b", true);
    term.input("c", true);

    expect(data).toHaveBeenCalledTimes(3);
    expect(data).toHaveBeenNthCalledWith(1, "a");
    expect(data).toHaveBeenNthCalledWith(2, "b");
    expect(data).toHaveBeenNthCalledWith(3, "c");

    term.dispose();
    node.remove();
  });

  it("does not emit readable", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);
    const readable = vi.fn();
    stdin.on("readable", readable);

    term.input("z", true);

    expect(readable).not.toHaveBeenCalled();

    term.dispose();
    node.remove();
  });

  it("read always returns null", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    expect(stdin.read()).toBeNull();

    term.input("x", true);

    expect(stdin.read()).toBeNull();

    term.dispose();
    node.remove();
  });
});

describe("TerminalReadableStream / Properties", () => {
  it("handles isTTY property", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    expect(stdin.isTTY).toBe(true);

    term.dispose();
    node.remove();
  });

  it("handles readable property", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    expect(stdin.readable).toBe(true);

    term.dispose();
    node.remove();
  });

  it("handles fd property", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    expect(stdin.fd).toBe(0);

    term.dispose();
    node.remove();
  });
});

describe("TerminalReadableStream / Raw Mode", () => {
  it("sets raw mode", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    expect(stdin.isRaw).toBe(true);

    const value = stdin.setRawMode(false);

    expect(stdin.isRaw).toBe(false);
    expect(value).toBe(stdin);

    term.dispose();
    node.remove();
  });
});

describe("TerminalReadableStream / No-op Methods", () => {
  it("sets encoding (no-op)", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    expect(() => stdin.setEncoding("utf-8")).not.toThrow();

    term.dispose();
    node.remove();
  });

  it("resumes stream (no-op)", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    const value = stdin.resume();

    expect(value).toBe(stdin);

    term.dispose();
    node.remove();
  });

  it("pauses stream (no-op)", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    const value = stdin.pause();

    expect(value).toBe(stdin);

    term.dispose();
    node.remove();
  });

  it("refs stream (no-op)", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    const value = stdin.ref();

    expect(value).toBe(stdin);

    term.dispose();
    node.remove();
  });

  it("unrefs stream (no-op)", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);

    expect(() => stdin.unref()).not.toThrow();

    term.dispose();
    node.remove();
  });
});

describe("TerminalReadableStream / Node Compatibility", () => {
  it("matches ReadStream contract for data events", () => {
    const term = new Terminal();
    const node = createContainer();
    term.open(node);

    const stdin = new TerminalReadableStream(term);
    const data = vi.fn();
    stdin.on("data", data);
    term.input("x", true);

    expect(data).toHaveBeenCalledWith("x");

    term.dispose();
    node.remove();
  });
});
