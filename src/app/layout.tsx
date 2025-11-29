import "./../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Coalition Con 2026",
  description: "Brainstorm and compare destinations for our group trip."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
