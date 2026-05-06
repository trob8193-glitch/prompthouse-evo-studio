import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PromptHouse Evo Studio OS",
  description: "Autonomous prompt-engineering and prompt-to-app studio."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
