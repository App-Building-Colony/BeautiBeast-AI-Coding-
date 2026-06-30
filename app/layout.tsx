import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent-Sentinel • Supply-Chain Swarm",
  description: "API-Agnostic PR Gatekeeper – Socket.dev telemetry + OpenRouter/Anthropic/Gemini/Ollama",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-obsidian text-zinc-100 antialiased socket-grid">
        {children}
      </body>
    </html>
  );
}
