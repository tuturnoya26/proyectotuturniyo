import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TU TURNO YA — Reservá tu turno',
  description: 'Encontrá la mejor barbería cerca tuyo y reservá tu turno en pocos toques con TU TURNO YA.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
