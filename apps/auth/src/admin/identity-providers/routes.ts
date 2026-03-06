import type { AppRouteObject } from "../routes";
import { IdentityProviderRoute } from "./routes/identity-provider";
import { IdentityProviderKeycloakOidcRoute } from "./routes/identity-provider-keycloak-oidc";
import { IdentityProviderOidcRoute } from "./routes/identity-provider-oidc";
import { IdentityProviderSamlRoute } from "./routes/identity-provider-saml";
import { IdentityProviderSpiffeRoute } from "./routes/identity-provider-spiffe";
import { IdentityProviderKubernetesRoute } from "./routes/identity-provider-kubernetes";
import { IdentityProvidersRoute } from "./routes/identity-providers";
import { IdentityProviderAddMapperRoute } from "./routes/add-mapper";
import { IdentityProviderEditMapperRoute } from "./routes/edit-mapper";
import { IdentityProviderCreateRoute } from "./routes/identity-provider-create";
import { IdentityProviderOAuth2Route } from "./routes/identity-provider-o-auth2";
import { IdentityProviderJWTAuthorizationGrantRoute } from "./routes/identity-provider-jwt-authorization-grant";

const routes: AppRouteObject[] = [
    IdentityProviderAddMapperRoute,
    IdentityProviderEditMapperRoute,
    IdentityProvidersRoute,
    IdentityProviderOidcRoute,
    IdentityProviderSamlRoute,
    IdentityProviderSpiffeRoute,
    IdentityProviderJWTAuthorizationGrantRoute,
    IdentityProviderKubernetesRoute,
    IdentityProviderKeycloakOidcRoute,
    IdentityProviderCreateRoute,
    IdentityProviderRoute,
    IdentityProviderOAuth2Route
];

export default routes;
