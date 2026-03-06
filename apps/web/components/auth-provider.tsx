"use client";

import { KeycloakProvider } from "@merge-rd/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <KeycloakProvider
      issuerUri={process.env.NEXT_PUBLIC_OIDC_ISSUER_URI}
      clientId={process.env.NEXT_PUBLIC_OIDC_CLIENT_ID}
    >
      {children}
    </KeycloakProvider>
  );
}
