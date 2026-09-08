import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="page-shell">{children}</main>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}
