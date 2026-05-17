import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MultiScreenQAGrid — Screen Monitoring Wall",
  description:
    "Monitor 50/100/500 digital signage screens simultaneously with AI anomaly detection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <nav className="border-b border-gray-800 bg-gray-900 px-4 py-3">
          <div className="mx-auto flex max-w-screen-2xl items-center gap-6">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-white"
            >
              MultiScreenQAGrid
            </Link>
            <div className="flex gap-4">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/heatmap">Heatmap</NavLink>
              <NavLink href="/compare">Compare</NavLink>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-screen-2xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
    >
      {children}
    </Link>
  );
}
