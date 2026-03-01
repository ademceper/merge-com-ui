import { type ReactNode } from 'react';

export function Protect({ children }: { children: ReactNode; [key: string]: any }) {
  return <>{children}</>;
}
