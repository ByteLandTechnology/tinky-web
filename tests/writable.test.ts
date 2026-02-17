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

describe("TerminalWritableStream / Basic Operations", () => {
  it("converts standalone LF to CRLF", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const writeSpy = vi.spyOn(terminal, "write");
    const stdout = new TerminalWritableStream(terminal);

    stdout.write("a\nb\r\nc\n");

    expect(writeSpy).toHaveBeenCalledWith("a\r\nb\r\nc\r\n");

    terminal.dispose();
    container.remove();
  });

  it("handles empty string", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const writeSpy = vi.spyOn(terminal, "write");
    const stdout = new TerminalWritableStream(terminal);

    stdout.write("");

    expect(writeSpy).toHaveBeenCalledWith("");

    terminal.dispose();
    container.remove();
  });

  it("handles string with only newlines", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const writeSpy = vi.spyOn(terminal, "write");
    const stdout = new TerminalWritableStream(terminal);

    stdout.write("\n\n\n");

    expect(writeSpy).toHaveBeenCalledWith("\r\n\r\n\r\n");

    terminal.dispose();
    container.remove();
  });

  it("preserves existing CRLF sequences", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const writeSpy = vi.spyOn(terminal, "write");
    const stdout = new TerminalWritableStream(terminal);

    stdout.write("line1\r\nline2\r\n");

    expect(writeSpy).toHaveBeenCalledWith("line1\r\nline2\r\n");

    terminal.dispose();
    container.remove();
  });

  it("handles mixed CRLF and LF correctly", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const writeSpy = vi.spyOn(terminal, "write");
    const stdout = new TerminalWritableStream(terminal);

    stdout.write("line1\nline2\r\nline3\nline4\r\n");

    expect(writeSpy).toHaveBeenCalledWith(
      "line1\r\nline2\r\nline3\r\nline4\r\n",
    );

    terminal.dispose();
    container.remove();
  });
});

describe("TerminalWritableStream / Callbacks and Return Values", () => {
  it("calls callback after write", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdout = new TerminalWritableStream(terminal);
    const callback = vi.fn();

    stdout.write("test", "utf-8", callback);

    expect(callback).toHaveBeenCalled();

    terminal.dispose();
    container.remove();
  });

  it("calls callback without error", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdout = new TerminalWritableStream(terminal);
    const callback = vi.fn();

    stdout.write("test", "utf-8", callback);

    expect(callback).toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalledWith(expect.any(Error));

    terminal.dispose();
    container.remove();
  });

  it("returns true from write", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdout = new TerminalWritableStream(terminal);

    const result = stdout.write("test");

    expect(result).toBe(true);

    terminal.dispose();
    container.remove();
  });
});

describe("TerminalWritableStream / End Method", () => {
  it("ends stream with final chunk", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const writeSpy = vi.spyOn(terminal, "write");
    const stdout = new TerminalWritableStream(terminal);

    stdout.end("final");

    expect(writeSpy).toHaveBeenCalledWith("final");

    terminal.dispose();
    container.remove();
  });

  it("chains end calls", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdout = new TerminalWritableStream(terminal);

    const result = stdout.end();

    expect(result).toBe(stdout);

    terminal.dispose();
    container.remove();
  });
});

describe("TerminalWritableStream / Properties", () => {
  it("handles isTTY property", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdout = new TerminalWritableStream(terminal);

    expect(stdout.isTTY).toBe(true);

    terminal.dispose();
    container.remove();
  });

  it("handles writable property", () => {
    const terminal = new Terminal();
    const container = createContainer();
    terminal.open(container);

    const stdout = new TerminalWritableStream(terminal);

    expect(stdout.writable).toBe(true);

    terminal.dispose();
    container.remove();
  });

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
});
