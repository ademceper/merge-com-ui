import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { Button } from "@merge-rd/ui/components/button";
import { Link } from "@tanstack/react-router";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toCustomUserFederation } from "@/admin/shared/lib/routes/user-federation";
import { useFederationComponent } from "./hooks/use-federation-component";

type FederatedUserLinkProps = {
    user: UserRepresentation;
};

export const FederatedUserLink = ({ user }: FederatedUserLinkProps) => {
    const access = useAccess();
    const { realm } = useRealm();

    const { data: component } = useFederationComponent(
        user.federationLink!,
        access.hasAccess("view-realm")
    );

    if (!component) return null;

    if (!access.hasAccess("view-realm")) return <span>{component.name}</span>;

    return (
        <Button variant="link" asChild>
            <Link
                to={
                    toCustomUserFederation({
                        id: component.id!,
                        providerId: component.providerId!,
                        realm
                    }) as string
                }
            >
                {component.name}
            </Link>
        </Button>
    );
};
