import type { AuthState } from "../types";
import { useDecodedToken } from "./helpers";

export function useAuth(): AuthState {
  const { logout, sub, orgId } = useDecodedToken();

  return {
    isLoaded: true,
    isSignedIn: true,
    userId: sub,
    orgId,
    orgRole: "org:admin",
    signOut: logout,
    getToken: async () => "",
    has: () => true,
  };
}
