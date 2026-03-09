import { IdentityProviderType } from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useState } from "react";
import { useIdentityProviders } from "@/admin/shared/api/use-identity-providers";
import type { ComponentProps } from "../dynamic/components";
import { MultiValuedListComponent } from "../dynamic/multivalued-list-component";

type IdentityProviderSelectProps = ComponentProps & {
    variant?: string;
    identityProviderType?: IdentityProviderType;
    realmOnly?: boolean;
};

export const IdentityProviderSelect = ({
    identityProviderType = IdentityProviderType.ANY,
    realmOnly = false,
    ...props
}: IdentityProviderSelectProps) => {
    const [search, setSearch] = useState("");

    const { data: identityProviders = [] } = useIdentityProviders(
        search,
        identityProviderType,
        realmOnly
    );

    return (
        <MultiValuedListComponent
            {...props}
            onSearch={setSearch}
            options={identityProviders.map(({ alias }) => alias!)}
        />
    );
};
