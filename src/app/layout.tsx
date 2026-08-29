import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DOCS V1 — Academic Laboratory Platform',
  description: 'Digital Academic Laboratory & Coding Workspace for Institutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070c1a] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
