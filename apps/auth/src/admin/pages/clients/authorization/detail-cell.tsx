import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { useEffect, useState } from "react";
import { KeycloakSpinner } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toPermissionDetails, toScopeDetails } from "@/admin/shared/lib/routes/clients";
import { useDetailCell } from "./hooks/use-detail-cell";
import { DetailDescription, DetailDescriptionLink } from "./detail-description";

type Scope = { id: string; name: string }[];

type DetailCellProps = {
    id: string;
    clientId: string;
    uris?: string[];
};

export const DetailCell = ({ id, clientId, uris }: DetailCellProps) => {
    const { realm } = useRealm();
    const [scope, setScope] = useState<Scope>();
    const [permissions, setPermissions] = useState<ResourceServerRepresentation[]>();

    const { data: detailCellData } = useDetailCell(clientId, id);

    useEffect(() => {
        if (detailCellData) {
            setScope(detailCellData[0]);
            setPermissions(detailCellData[1]);
        }
    }, [detailCellData]);

    if (!permissions || !scope) {
        return <KeycloakSpinner />;
    }

    return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 keycloak_resource_details">
            <DetailDescription name="uris" array={uris} />
            <DetailDescriptionLink
                name="scopes"
                array={scope}
                convert={s => s.name}
                link={scope =>
                    toScopeDetails({ id: clientId, realm, scopeId: scope.id! })
                }
            />
            <DetailDescriptionLink
                name="associatedPermissions"
                array={permissions}
                convert={p => p.name!}
                link={permission =>
                    toPermissionDetails({
                        id: clientId,
                        realm,
                        permissionId: permission.id!,
                        permissionType: "resource"
                    })
                }
            />
        </dl>
    );
};
