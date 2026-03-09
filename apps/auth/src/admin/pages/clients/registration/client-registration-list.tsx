import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Button } from "@merge-rd/ui/components/button";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useDeleteRegistrationPolicy } from "../hooks/use-delete-registration-policy";
import type { ClientRegistrationParams } from "@/admin/shared/lib/routes/clients";
import { clientKeys } from "../hooks/keys";
import { useClientRegistrationPolicies } from "../hooks/use-client-registration-policies";
import { AddClientRegistrationPolicyDialog } from "./add-client-registration-policy-dialog";
import { EditClientRegistrationPolicyDialog } from "./edit-client-registration-policy-dialog";

type ClientRegistrationListProps = {
    subType: "anonymous" | "authenticated";
};

export const ClientRegistrationList = ({ subType }: ClientRegistrationListProps) => {

    const { t } = useTranslation();
    const { subTab: _subTab } = useParams({ strict: false }) as ClientRegistrationParams;
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    const { mutateAsync: deletePolicy } = useDeleteRegistrationPolicy();
    const { data: policies = [] } = useClientRegistrationPolicies(subType);
    const [selectedPolicy, setSelectedPolicy] = useState<ComponentRepresentation>();
    const [editPolicy, setEditPolicy] = useState<ComponentRepresentation>();
    const refresh = () => {
        queryClient.invalidateQueries({
            queryKey: clientKeys.registrationPolicies(subType)
        });
    };

    const onDeleteConfirm = async () => {
        if (!selectedPolicy?.id) return;
        try {
            await deletePolicy(selectedPolicy.id);
            toast.success(t("clientRegisterPolicyDeleteSuccess"));
            setSelectedPolicy(undefined);
            refresh();
        } catch (error) {
            toast.error(
                t("clientRegisterPolicyDeleteError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
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
            <AlertDialog
                open={!!selectedPolicy}
                onOpenChange={open => !open && setSelectedPolicy(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("clientRegisterPolicyDeleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("clientRegisterPolicyDeleteConfirm", {
                                name: selectedPolicy?.name
                            })}
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
                columns={columns}
                data={policies}
                searchColumnId="name"
                searchPlaceholder={t("searchClientRegistration")}
                emptyMessage={t("noAccessPolicies")}
                onRowClick={row => setEditPolicy(row.original)}
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
                                <span className="hidden sm:inline">
                                    {t("createPolicy")}
                                </span>
                            </Button>
                        }
                    />
                }
            />
        </>
    );
};
