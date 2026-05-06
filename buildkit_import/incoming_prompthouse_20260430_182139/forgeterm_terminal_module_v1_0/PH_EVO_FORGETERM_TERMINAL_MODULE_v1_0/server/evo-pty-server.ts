import http from "node:http";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { WebSocketServer } from "ws";
import pty from "node-pty";

const PORT = Number(process.env.EVO_TERM_PORT ?? 8787);
const SHELL = os.platform() === "win32" ? "powershell.exe" : process.env.SHELL || "bash";
const CWD = process.env.EVO_TERM_CWD || process.cwd();

const server = http.createServer();
const wss = new WebSocketServer({ server, path: "/pty" });

console.log(`ForgeTerm ShellBridge starting on ws://localhost:${PORT}/pty`);
console.log(`Shell: ${SHELL}`);
console.log(`CWD: ${CWD}`);
console.log("Boundary: run only inside a trusted dev sandbox.");

wss.on("connection", (socket) => {
  const term = pty.spawn(SHELL, [], {
    name: "xterm-color",
    cols: 100,
    rows: 30,
    cwd: path.resolve(CWD),
    env: {
      ...process.env,
      TERM: "xterm-256color",
      PROMPTHOUSE_FORGETERM: "1",
    },
  });

  term.onData((data) => {
    socket.send(data);
  });

  socket.on("message", (message) => {
    term.write(message.toString());
  });

  socket.on("close", () => {
    term.kill();
  });

  socket.on("error", () => {
    term.kill();
  });
});

server.listen(PORT);
