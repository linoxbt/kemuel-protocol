import { NetworkGuard } from '@/components/shell/NetworkGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <NetworkGuard>{children}</NetworkGuard>;
}
