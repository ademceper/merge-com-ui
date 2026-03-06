import { useCallback } from "react";
import type { AuthState } from "../types";
import { useDecodedToken } from "./helpers";

export function useAuth(): AuthState {
  const { logout, sub, orgId, issuer } = useDecodedToken();

  const accountManagement = useCallback(() => {
    if (issuer) {
      window.open(`${issuer}/account`, "_blank");
    }
  }, [issuer]);

  return {
    isLoaded: true,
    isSignedIn: true,
    userId: sub,
    orgId,
    orgRole: "org:admin",
    signOut: logout,
    getToken: async () => "",
    has: () => true,
    accountManagement,
  };
}
