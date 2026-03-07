import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge-rd/ui/components/button";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAdminClient } from "../../app/admin-client";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { toCustomUserFederation } from "../user-federation/routes/custom-user-federation";

type FederatedUserLinkProps = {
    user: UserRepresentation;
};

export const FederatedUserLink = ({ user }: FederatedUserLinkProps) => {
    const { adminClient } = useAdminClient();

    const access = useAccess();
    const { realm } = useRealm();

    const [component, setComponent] = useState<ComponentRepresentation>();

    useFetch(
        () =>
            access.hasAccess("view-realm")
                ? adminClient.components.findOne({
                      id: user.federationLink!
                  })
                : adminClient.userStorageProvider.name({
                      id: user.federationLink!
                  }),
        setComponent,
        []
    );

    if (!component) return null;

    if (!access.hasAccess("view-realm")) return <span>{component.name}</span>;

    return (
        <Button variant="link" asChild>
            <Link
                to={toCustomUserFederation({
                    id: component.id!,
                    providerId: component.providerId!,
                    realm
                }) as string}
            >
                {component.name}
            </Link>
        </Button>
    );
};
