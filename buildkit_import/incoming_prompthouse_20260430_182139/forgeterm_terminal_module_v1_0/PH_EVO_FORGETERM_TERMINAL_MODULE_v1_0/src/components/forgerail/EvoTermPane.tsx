"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

import { evaluateCommand } from "../../lib/forgerail/evoTerminalPolicy";
import { createTerminalProofReceipt } from "../../lib/forgerail/proofReceipts";
import type { EvoTermPaneProps } from "../../lib/forgerail/evoTerminalTypes";

const PROMPT = "\r\nph-evo ▸ ";

export function EvoTermPane({
  mode = "virtual",
  websocketUrl = "ws://localhost:8787/pty",
  title = "ForgeTerm Pane",
  projectName = "PromptHouse Evo Studio",
  className,
  onProofReceipt,
}: EvoTermPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const commandBufferRef = useRef("");
  const [status, setStatus] = useState<"offline" | "virtual" | "connecting" | "connected" | "blocked">("offline");
  const [lastCommand, setLastCommand] = useState("none");
  const [lastRisk, setLastRisk] = useState("low");

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 13,
      theme: {
        background: "#05070d",
        foreground: "#f7f0df",
        cursor: "#f5b942",
        selectionBackground: "#1e3a5f",
        black: "#05070d",
        red: "#ff6b6b",
        green: "#55d47e",
        yellow: "#f5b942",
        blue: "#71a7ff",
        magenta: "#b877ff",
        cyan: "#55f0ff",
        white: "#f7f0df",
      },
      allowProposedApi: false,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    fit.fit();

    terminalRef.current = term;
    fitRef.current = fit;

    writeHeader(term, title, projectName, mode);

    if (mode === "pty") {
      connectPty(term, websocketUrl);
    } else {
      setStatus("virtual");
      term.write(PROMPT);
      attachVirtualInput(term);
    }

    const resize = () => fit.fit();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      socketRef.current?.close();
      term.dispose();
    };
  }, [mode, websocketUrl, projectName, title]);

  function writeHeader(term: Terminal, heading: string, project: string, activeMode: string) {
    term.writeln("╭────────────────────────────────────────────╮");
    term.writeln(`│ ${heading.padEnd(42).slice(0, 42)} │`);
    term.writeln("├────────────────────────────────────────────┤");
    term.writeln(`│ Project: ${project.padEnd(33).slice(0, 33)} │`);
    term.writeln(`│ Mode: ${activeMode.padEnd(36).slice(0, 36)} │`);
    term.writeln("│ Rule: proof before verified status          │");
    term.writeln("╰────────────────────────────────────────────╯");
    term.writeln("");
  }

  function connectPty(term: Terminal, url: string) {
    setStatus("connecting");
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus("connected");
      term.writeln("ShellBridge connected. Live PTY mode active.");
    };

    socket.onmessage = (event) => {
      term.write(event.data);
    };

    socket.onerror = () => {
      setStatus("blocked");
      term.writeln("\r\nBoundary: PTY connection failed. Start server/evo-pty-server.ts or use virtual mode.");
    };

    socket.onclose = () => {
      setStatus("offline");
      term.writeln("\r\nHeartbeatPTY: disconnected.");
    };

    term.onData((data) => {
      socket.send(data);
    });
  }

  function attachVirtualInput(term: Terminal) {
    term.onData((data) => {
      const code = data.charCodeAt(0);

      if (data === "\r") {
        const command = commandBufferRef.current.trim();
        commandBufferRef.current = "";
        setLastCommand(command || "empty");
        runVirtualCommand(term, command);
        return;
      }

      if (code === 127) {
        if (commandBufferRef.current.length > 0) {
          commandBufferRef.current = commandBufferRef.current.slice(0, -1);
          term.write("\b \b");
        }
        return;
      }

      if (code < 32) return;

      commandBufferRef.current += data;
      term.write(data);
    });
  }

  function runVirtualCommand(term: Terminal, command: string) {
    const policy = evaluateCommand(command, "virtual");
    setLastRisk(policy.risk);
    term.writeln("");

    if (!command) {
      term.write(PROMPT);
      return;
    }

    if (!policy.allowed && policy.status === "blocked") {
      const output = `Blocked: ${policy.reason}`;
      term.writeln(output);
      emitProof(command, "blocked", policy.risk, output, policy.reason);
      term.write(PROMPT);
      return;
    }

    if (policy.approvalRequired) {
      const output = `SovereignGate: approval required before live execution. Virtual preview only. Reason: ${policy.reason}`;
      term.writeln(output);
      emitProof(command, "approval_required", policy.risk, output, policy.reason);
      term.write(PROMPT);
      return;
    }

    const output = virtualCommandOutput(command);
    term.writeln(output);
    emitProof(command, "verified", policy.risk, output);
    term.write(PROMPT);
  }

  function emitProof(command: string, status: "verified" | "blocked" | "approval_required", risk: "low" | "medium" | "high" | "destructive", output: string, boundary?: string) {
    const receipt = createTerminalProofReceipt({
      command,
      mode,
      status,
      risk,
      output,
      boundary,
    });
    onProofReceipt?.(receipt);
  }

  function virtualCommandOutput(command: string): string {
    const normalized = command.toLowerCase();

    if (["help", "ph help"].includes(normalized)) {
      return [
        "ForgeTerm commands:",
        "  ph status              show studio status",
        "  ph bots                list public bot lanes",
        "  ph proof               show proof rule",
        "  ph build forgerail     generate ForgeRail build plan",
        "  ph builder new-agent   create Evo Studio Builder recipe draft",
        "  clear                  clear terminal",
      ].join("\r\n");
    }

    if (normalized === "clear") {
      terminalRef.current?.clear();
      return "ForgeTerm cleared.";
    }

    if (normalized === "ph status") {
      return "Status: built UI pane / virtual mode active / PTY requires ShellBridge backend.";
    }

    if (normalized === "ph bots") {
      return "Public bots: Evo, Companion, Dev, Builder, Verifier, Conductor, Boundary, Ledger, Memory, Heartbeat, Sovereignty.";
    }

    if (normalized === "ph proof") {
      return "Proof rule: no receipt means no verified claim. LedgerTrace creates terminal proof receipts.";
    }

    if (normalized === "ph build forgerail") {
      return "ForgeRail plan: Installer Doctor → Backend Forge → Secret Rail → Device Lab → Signing Concierge → Store Concierge → Proof Deck Sync.";
    }

    if (normalized === "ph builder new-agent") {
      return "Evo Agent Recipe draft: Brain → References → Tools → Rules → Approval → Tests → Proof → Publish.";
    }

    return `VirtualShell executed: ${command}\r\nBoundary: this was browser-safe simulation, not host shell execution.`;
  }

  return (
    <section
      className={className}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(245,185,66,.28)",
        background: "linear-gradient(180deg, #101725, #05070d)",
        boxShadow: "0 20px 60px rgba(0,0,0,.35)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          color: "#f7f0df",
        }}
      >
        <div>
          <strong style={{ color: "#f5b942" }}>{title}</strong>
          <div style={{ fontSize: 12, color: "#b7bfd1" }}>ForgeTTY / ShellBridge / LedgerTrace</div>
        </div>
        <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
          <span>{status}</span>
          <span>risk:{lastRisk}</span>
          <span>cmd:{lastCommand}</span>
        </div>
      </header>
      <div ref={containerRef} style={{ height: 420, padding: 8 }} />
    </section>
  );
}
