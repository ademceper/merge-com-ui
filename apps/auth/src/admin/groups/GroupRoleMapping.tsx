/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/groups/GroupRoleMapping.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { AlertVariant } from "../../shared/@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { useAlerts } from "../../shared/keycloak-ui-shared";
import { RoleMapping, Row } from "../components/role-mapping/RoleMapping";

type GroupRoleMappingProps = {
    id: string;
    name: string;
    canManageGroup: boolean;
};

export const GroupRoleMapping = ({ id, name, canManageGroup }: GroupRoleMappingProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();

    const assignRoles = async (rows: Row[]) => {
        try {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .map(row => row.role as RoleMappingPayload)
                .flat();
            await adminClient.groups.addRealmRoleMappings({
                id,
                roles: realmRoles
            });
            await Promise.all(
                rows
                    .filter(row => row.client !== undefined)
                    .map(row =>
                        adminClient.groups.addClientRoleMappings({
                            id,
                            clientUniqueId: row.client!.id!,
                            roles: [row.role as RoleMappingPayload]
                        })
                    )
            );
            addAlert(t("roleMappingUpdatedSuccess"), AlertVariant.success);
        } catch (error) {
            addError("roleMappingUpdatedError", error);
        }
    };

    return (
        <RoleMapping
            isManager={canManageGroup}
            name={name}
            id={id}
            type="groups"
            save={assignRoles}
        />
    );
};
