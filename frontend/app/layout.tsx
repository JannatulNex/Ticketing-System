import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support System',
  description: 'Customer support ticketing with real-time chat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

