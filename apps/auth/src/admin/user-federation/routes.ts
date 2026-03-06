import type { AppRouteObject } from "../routes";
import { CustomUserFederationRoute } from "./routes/custom-user-federation";
import { NewCustomUserFederationRoute } from "./routes/new-custom-user-federation";
import { NewKerberosUserFederationRoute } from "./routes/new-kerberos-user-federation";
import { NewLdapUserFederationRoute } from "./routes/new-ldap-user-federation";
import { UserFederationRoute } from "./routes/user-federation";
import { UserFederationKerberosRoute } from "./routes/user-federation-kerberos";
import {
    UserFederationLdapRoute,
    UserFederationLdapWithTabRoute
} from "./routes/user-federation-ldap";
import { UserFederationLdapMapperRoute } from "./routes/user-federation-ldap-mapper";
import { UserFederationsKerberosRoute } from "./routes/user-federations-kerberos";
import { UserFederationsLdapRoute } from "./routes/user-federations-ldap";

const routes: AppRouteObject[] = [
    UserFederationRoute,
    UserFederationsKerberosRoute,
    NewKerberosUserFederationRoute,
    UserFederationKerberosRoute,
    UserFederationsLdapRoute,
    NewLdapUserFederationRoute,
    UserFederationLdapRoute,
    UserFederationLdapWithTabRoute,
    UserFederationLdapMapperRoute,
    NewCustomUserFederationRoute,
    CustomUserFederationRoute
];

export default routes;
