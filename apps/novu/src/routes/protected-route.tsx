import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  condition?: (has: (params: Record<string, string>) => boolean) => boolean;
  isDrawerRoute?: boolean;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return <>{children}</>;
};
