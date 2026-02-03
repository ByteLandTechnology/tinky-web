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

describe("TerminalWritableStream / Cursor Positioning", () => {
  describe("cursorTo", () => {
    it("moves cursor to absolute position", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.cursorTo(5, 3);

      expect(writeSpy).toHaveBeenCalledWith("\x1b[4;6H");

      terminal.dispose();
      container.remove();
    });

    it("moves cursor to column only", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.cursorTo(10);

      expect(writeSpy).toHaveBeenCalledWith("\x1b[11G");

      terminal.dispose();
      container.remove();
    });

    it("handles cursorTo with callback", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const stdout = new TerminalWritableStream(terminal);
      const callback = vi.fn();

      stdout.cursorTo(5, callback);

      expect(callback).toHaveBeenCalled();

      terminal.dispose();
      container.remove();
    });

    it("handles zero position", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.cursorTo(0, 0);

      expect(writeSpy).toHaveBeenCalledWith("\x1b[1;1H");

      terminal.dispose();
      container.remove();
    });
  });

  describe("moveCursor", () => {
    it("moves cursor right and down", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.moveCursor(3, 2);

      expect(writeSpy).toHaveBeenCalledWith("\x1b[3C");
      expect(writeSpy).toHaveBeenCalledWith("\x1b[2B");

      terminal.dispose();
      container.remove();
    });

    it("moves cursor left and up", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.moveCursor(-2, -1);

      expect(writeSpy).toHaveBeenCalledWith("\x1b[2D");
      expect(writeSpy).toHaveBeenCalledWith("\x1b[1A");

      terminal.dispose();
      container.remove();
    });

    it("handles zero movement", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.moveCursor(0, 0);

      expect(writeSpy).not.toHaveBeenCalled();

      terminal.dispose();
      container.remove();
    });

    it("handles mixed directions", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.moveCursor(5, -3);

      expect(writeSpy).toHaveBeenCalledWith("\x1b[5C");
      expect(writeSpy).toHaveBeenCalledWith("\x1b[3A");

      terminal.dispose();
      container.remove();
    });
  });
});
