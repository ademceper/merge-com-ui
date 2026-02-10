import ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge/ui/components/alert-dialog";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useRealm } from "../../context/realm-context/RealmContext";
import { ClientRegistrationParams } from "../routes/client-registration-path";
import { AddClientRegistrationPolicyDialog } from "./AddClientRegistrationPolicyDialog";
import { EditClientRegistrationPolicyDialog } from "./EditClientRegistrationPolicyDialog";

type ClientRegistrationListProps = {
    subType: "anonymous" | "authenticated";
};

export const ClientRegistrationList = ({ subType }: ClientRegistrationListProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { subTab: _subTab } = useParams<ClientRegistrationParams>();
    const { realm } = useRealm();
    const [policies, setPolicies] = useState<ComponentRepresentation[]>([]);
    const [selectedPolicy, setSelectedPolicy] = useState<ComponentRepresentation>();
    const [editPolicy, setEditPolicy] = useState<ComponentRepresentation>();
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

    const onDeleteConfirm = async () => {
        if (!selectedPolicy?.id) return;
        try {
            await adminClient.components.del({
                realm,
                id: selectedPolicy.id
            });
            toast.success(t("clientRegisterPolicyDeleteSuccess"));
            setSelectedPolicy(undefined);
            refresh();
        } catch (error) {
            toast.error(t("clientRegisterPolicyDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const columns: ColumnDef<ComponentRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => (
                <button
                    type="button"
                    className="text-primary hover:underline text-left"
                    onClick={() => setEditPolicy(row.original)}
                >
                    {row.original.name}
                </button>
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
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setEditPolicy(row.original)}
                    >
                        <PencilSimple className="size-4 shrink-0" />
                        {t("edit")}
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setSelectedPolicy(row.original)}
                    >
                        <Trash className="size-4 shrink-0" />
                        {t("delete")}
                    </button>
                </DataTableRowActions>
            )
        }
    ];

    return (
        <>
            <AlertDialog open={!!selectedPolicy} onOpenChange={(open) => !open && setSelectedPolicy(undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("clientRegisterPolicyDeleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("clientRegisterPolicyDeleteConfirm", { name: selectedPolicy?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditClientRegistrationPolicyDialog
                policy={editPolicy ?? null}
                subTab={subType}
                onClose={() => setEditPolicy(undefined)}
                onSuccess={refresh}
            />

            <DataTable
                key={key}
                columns={columns}
                data={policies}
                searchColumnId="name"
                searchPlaceholder={t("searchClientRegistration")}
                emptyMessage={t("noAccessPolicies")}
                onRowClick={(row) => setEditPolicy(row.original)}
                toolbar={
                    <AddClientRegistrationPolicyDialog
                        subTab={subType}
                        onSuccess={refresh}
                        trigger={
                            <Button
                                type="button"
                                data-testid={`createPolicy-${subType}`}
                                variant="default"
                                className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                aria-label={t("createPolicy")}
                            >
                                <Plus size={20} className="shrink-0 sm:hidden" />
                                <span className="hidden sm:inline">{t("createPolicy")}</span>
                            </Button>
                        }
                    />
                }
            />
        </>
    );
};
