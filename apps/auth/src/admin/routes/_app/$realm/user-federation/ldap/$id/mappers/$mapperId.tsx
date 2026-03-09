import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/user-federation/ldap/$id/mappers/$mapperId"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../pages/user-federation/ldap/mappers/ldap-mapper-details"
            ),
        "LdapMapperDetails"
    )
});
