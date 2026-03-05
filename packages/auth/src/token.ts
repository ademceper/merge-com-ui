import { getOidc } from "./oidc";

export async function getToken(): Promise<string> {
  const oidc = await getOidc();

  if (!oidc.isUserLoggedIn) {
    return '';
  }

  return oidc.getAccessToken();
}
