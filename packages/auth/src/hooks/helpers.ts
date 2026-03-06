import { useOidc } from "../oidc";

export function useDecodedToken() {
  const oidc = useOidc();
  const token = oidc.decodedIdToken as Record<string, unknown>;

  return {
    ...oidc,
    sub: (token.sub as string) ?? "unknown",
    email: (token.email as string) ?? "",
    givenName: (token.given_name as string) ?? (token.preferred_username as string) ?? "",
    familyName: (token.family_name as string) ?? "",
    picture: (token.picture as string) ?? "",
    orgId: (token.org_id as string) ?? "default-org",
    orgName: (token.org_name as string) ?? "Organization",
    issuer: (token.iss as string) ?? "",
  };
}
