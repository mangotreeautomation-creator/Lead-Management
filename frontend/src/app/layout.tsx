import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';

export const metadata: Metadata = {
  title: 'LeadPulse Enterprise | Multi-Vertical Operations & Telemetry Platform',
  description: 'Enterprise Lead Management & Financial Operations Platform for Palmistry, Vastu Reports, Webinars, and Consultancy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased select-none font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
