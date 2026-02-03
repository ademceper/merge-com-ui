/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/OrganizationsSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { useFetch, useAlerts } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import { toEditOrganization } from "../organizations/routes/EditOrganization";
import { toAddOrganization } from "./routes/AddOrganization";

export default function OrganizationSection() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
    const navigate = useNavigate();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [organizations, setOrganizations] = useState<OrganizationRepresentation[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<OrganizationRepresentation>();

    useFetch(
        () => adminClient.organizations.find({}),
        (orgs) => setOrganizations(orgs),
        [key]
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "organizationDelete",
        messageKey: "organizationDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.organizations.delById({
                    id: selectedOrg!.id!
                });
                addAlert(t("organizationDeletedSuccess"));
                refresh();
            } catch (error) {
                addError("organizationDeleteError", error);
            }
        }
    });

    const columns: ColumnDef<OrganizationRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => (
                <Link
                    className="text-primary hover:underline"
                    to={toEditOrganization({
                        realm,
                        id: row.original.id!,
                        tab: "settings"
                    })}
                >
                    {row.original.name}
                </Link>
            )
        },
        {
            accessorKey: "domains",
            header: t("domains"),
            cell: ({ row }) => {
                const domains = row.original.domains;
                if (!domains || domains.length === 0) return "-";
                return domains.map(d => d.name).join(", ");
            }
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => row.original.description || "-"
        },
        {
            id: "actions",
            header: "",
            size: 50,
            enableHiding: false,
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <button
                        type="button"
                        className="w-full rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() =>
                            navigate(
                                toEditOrganization({
                                    realm,
                                    id: row.original.id!,
                                    tab: "settings"
                                })
                            )
                        }
                    >
                        {t("edit")}
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                        type="button"
                        className="w-full rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                            setSelectedOrg(row.original);
                            toggleDeleteDialog();
                        }}
                    >
                        {t("delete")}
                    </button>
                </DataTableRowActions>
            )
        }
    ];

    return (
        <>
            <ViewHeader
                titleKey="organizationsList"
                subKey="organizationsExplain"
                divider
            />
            <div className="py-6 px-0">
                <DeleteConfirm />
                <DataTable
                    key={key}
                    columns={columns}
                    data={organizations}
                    searchColumnId="name"
                    searchPlaceholder={t("searchOrganization")}
                    emptyMessage={t("emptyOrganizations")}
                    toolbar={
                        <Button data-testid="addOrganization" asChild>
                            <Link to={toAddOrganization({ realm })}>
                                {t("createOrganization")}
                            </Link>
                        </Button>
                    }
                />
            </div>
        </>
    );
}
