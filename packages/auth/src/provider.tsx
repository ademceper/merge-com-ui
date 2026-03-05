import { type ReactNode } from "react";
import {
  bootstrapOidc,
  OidcInitializationGate,
  OidcInitializationErrorGate,
} from "./oidc";

let bootstrapped = false;

export type KeycloakProviderProps = {
  issuerUri?: string;
  clientId?: string;
  mock?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
};

function ensureBootstrap({ issuerUri, clientId, mock }: Omit<KeycloakProviderProps, "children">) {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;

  if (mock || (!issuerUri && !clientId)) {
    bootstrapOidc({ implementation: "mock" });
  } else {
    bootstrapOidc({
      implementation: "real",
      issuerUri: issuerUri!,
      clientId: clientId!,
    });
  }
}

export function KeycloakProvider({
  children,
  fallback,
  ...config
}: KeycloakProviderProps) {
  ensureBootstrap(config);

  return (
    <OidcInitializationGate fallback={fallback ?? null}>
      <OidcInitializationErrorGate
        errorComponent={({ oidcInitializationError }) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100svh",
              gap: "0.5rem",
            }}
          >
            <h1 style={{ fontSize: "1.125rem", fontWeight: 600 }}>
              Authentication Error
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#888" }}>
              {oidcInitializationError.message}
            </p>
          </div>
        )}
      >
        {children}
      </OidcInitializationErrorGate>
    </OidcInitializationGate>
  );
}
