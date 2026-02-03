/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/registration/ClientRegistrationList.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useAlerts, useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { useRealm } from "../../context/realm-context/RealmContext";
import useToggle from "../../utils/useToggle";
import { toRegistrationProvider } from "../routes/AddRegistrationProvider";
import { ClientRegistrationParams } from "../routes/client-registration-path";
import { AddProviderDialog } from "./AddProviderDialog";

type ClientRegistrationListProps = {
    subType: "anonymous" | "authenticated";
};

export const ClientRegistrationList = ({ subType }: ClientRegistrationListProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { subTab } = useParams<ClientRegistrationParams>();
    const navigate = useNavigate();

    const { addAlert, addError } = useAlerts();
    const { realm } = useRealm();
    const [policies, setPolicies] = useState<ComponentRepresentation[]>([]);
    const [selectedPolicy, setSelectedPolicy] = useState<ComponentRepresentation>();
    const [isAddDialogOpen, toggleAddDialog] = useToggle();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    useFetch(
        () =>
            adminClient.components.find({
                type: "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy"
            }),
        policies => setPolicies(policies.filter(p => p.subType === subType)),
        [key, subType]
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "clientRegisterPolicyDeleteConfirmTitle",
        messageKey: t("clientRegisterPolicyDeleteConfirm", {
            name: selectedPolicy?.name
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.components.del({
                    realm,
                    id: selectedPolicy?.id!
                });
                addAlert(t("clientRegisterPolicyDeleteSuccess"));
                setSelectedPolicy(undefined);
                refresh();
            } catch (error) {
                addError("clientRegisterPolicyDeleteError", error);
            }
        }
    });

    const columns: ColumnDef<ComponentRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => (
                <Link
                    className="text-primary hover:underline"
                    to={toRegistrationProvider({
                        realm,
                        subTab: subTab || "anonymous",
                        providerId: row.original.providerId!,
                        id: row.original.id
                    })}
                >
                    {row.original.name}
                </Link>
            )
        },
        {
            accessorKey: "providerId",
            header: t("providerId"),
            cell: ({ row }) => row.original.providerId || "-"
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
                        className="w-full rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                            setSelectedPolicy(row.original);
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
        <div className="p-6">
            {isAddDialogOpen && (
                <AddProviderDialog
                    onConfirm={providerId =>
                        navigate(
                            toRegistrationProvider({
                                realm,
                                subTab: subTab || "anonymous",
                                providerId
                            })
                        )
                    }
                    toggleDialog={toggleAddDialog}
                />
            )}
            <DeleteConfirm />
            <DataTable
                key={key}
                columns={columns}
                data={policies}
                searchColumnId="name"
                searchPlaceholder={t("searchClientRegistration")}
                emptyMessage={t("noAccessPolicies")}
                toolbar={
                    <Button
                        data-testid={`createPolicy-${subType}`}
                        onClick={toggleAddDialog}
                    >
                        {t("createPolicy")}
                    </Button>
                }
            />
        </div>
    );
};
