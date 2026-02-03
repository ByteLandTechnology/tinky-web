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

describe("TerminalWritableStream / Screen Operations", () => {
  describe("clearLine", () => {
    it("clears line to the left (dir=-1)", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.clearLine(-1);
      expect(writeSpy).toHaveBeenLastCalledWith("\x1b[1K");

      terminal.dispose();
      container.remove();
    });

    it("clears line to the right (dir=1)", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.clearLine(1);
      expect(writeSpy).toHaveBeenLastCalledWith("\x1b[0K");

      terminal.dispose();
      container.remove();
    });

    it("clears entire line (dir=0)", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.clearLine(0);
      expect(writeSpy).toHaveBeenLastCalledWith("\x1b[2K");

      terminal.dispose();
      container.remove();
    });
  });

  describe("clearScreenDown", () => {
    it("clears screen from cursor to end", () => {
      const terminal = new Terminal();
      const container = createContainer();
      terminal.open(container);

      const writeSpy = vi.spyOn(terminal, "write");
      const stdout = new TerminalWritableStream(terminal);

      stdout.clearScreenDown();

      expect(writeSpy).toHaveBeenCalledWith("\x1b[J");

      terminal.dispose();
      container.remove();
    });
  });
});
