import type { Metadata } from 'next';
import { Providers } from './providers';
import { Masthead } from '@/components/shell/Masthead';
import { Footer } from '@/components/shell/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kemuel Protocol',
  description: 'A continuous-truth oracle for real-world assets on BOT Chain.',
  icons: { icon: '/brand/logo-bracket.svg' },
};

// wagmi/RainbowKit's providers depend on browser-only WalletConnect
// internals that crash during Next.js's static build-time prerendering
// (a known class of issue for this stack in the App Router). Rendering
// every route dynamically instead of statically avoids it.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Masthead />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
