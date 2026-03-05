import { oidcSpa } from "oidc-spa/react-spa";
import { oidcEarlyInit } from "oidc-spa/entrypoint";

if (typeof window !== "undefined") {
  oidcEarlyInit({ BASE_URL: "/" });
}

export const {
  bootstrapOidc,
  useOidc,
  getOidc,
  OidcInitializationGate,
  OidcInitializationErrorGate,
} = oidcSpa.withAutoLogin().createUtils();
