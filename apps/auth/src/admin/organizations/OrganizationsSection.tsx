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
import { FormSubmitButton, useFetch, useAlerts } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { arrayToKeyValue } from "../components/key-value-form/key-value-convert";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { FormAccess } from "../components/form/FormAccess";
import { ViewHeader } from "../components/view-header/ViewHeader";
import helpUrls from "../help-urls";
import { useRealm } from "../context/realm-context/RealmContext";
import {
    OrganizationForm,
    OrganizationFormType,
    convertToOrg
} from "./OrganizationForm";

export default function OrganizationSection() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [organizations, setOrganizations] = useState<OrganizationRepresentation[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<OrganizationRepresentation>();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editOrg, setEditOrg] = useState<OrganizationRepresentation | null>(null);

    const createForm = useForm<OrganizationFormType>({ mode: "onChange" });
    const editForm = useForm<OrganizationFormType>({ mode: "onChange" });

    useEffect(() => {
        if (createDialogOpen) {
            createForm.reset({});
        }
    }, [createDialogOpen]);

    useEffect(() => {
        if (editOrg) {
            editForm.reset({
                ...editOrg,
                domains: editOrg.domains?.map(d => d.name),
                attributes: arrayToKeyValue(editOrg.attributes)
            });
        }
    }, [editOrg]);

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

    const onCreateSave = async (org: OrganizationFormType) => {
        try {
            const organization = convertToOrg(org);
            await adminClient.organizations.create(organization);
            addAlert(t("organizationSaveSuccess"));
            setCreateDialogOpen(false);
            createForm.reset();
            refresh();
        } catch (error) {
            addError("organizationSaveError", error);
        }
    };

    const onEditSave = async (org: OrganizationFormType) => {
        if (!editOrg?.id) return;
        try {
            const organization = convertToOrg(org);
            await adminClient.organizations.updateById({ id: editOrg.id }, organization);
            addAlert(t("organizationSaveSuccess"));
            setEditOrg(null);
            refresh();
        } catch (error) {
            addError("organizationSaveError", error);
        }
    };

    const columns: ColumnDef<OrganizationRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => row.original.name
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
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setEditOrg(row.original)}
                    >
                        <PencilSimple className="size-4 shrink-0" />
                        {t("edit")}
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                            setSelectedOrg(row.original);
                            toggleDeleteDialog();
                        }}
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
            <ViewHeader
                titleKey="organizationsList"
                subKey="organizationsExplain"
                helpUrl={helpUrls.organizationsUrl}
                divider
            />
            <div className="py-6 px-0">
                <DeleteConfirm />

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <FormProvider {...createForm}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{t("createOrganization")}</DialogTitle>
                            </DialogHeader>
                            <FormAccess
                                id="create-org-form"
                                role="anyone"
                                onSubmit={createForm.handleSubmit(onCreateSave)}
                                isHorizontal
                            >
                                <OrganizationForm />
                            </FormAccess>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateDialogOpen(false)}
                                >
                                    {t("cancel")}
                                </Button>
                                <FormSubmitButton
                                    form="create-org-form"
                                    formState={createForm.formState}
                                    data-testid="save"
                                >
                                    {t("save")}
                                </FormSubmitButton>
                            </DialogFooter>
                        </DialogContent>
                    </FormProvider>
                </Dialog>

                <Dialog open={!!editOrg} onOpenChange={(open) => !open && setEditOrg(null)}>
                    <FormProvider {...editForm}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{t("organizationDetails")}</DialogTitle>
                            </DialogHeader>
                            <FormAccess
                                id="edit-org-form"
                                role="anyone"
                                onSubmit={editForm.handleSubmit(onEditSave)}
                                isHorizontal
                            >
                                <OrganizationForm readOnly={false} />
                            </FormAccess>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditOrg(null)}
                                >
                                    {t("cancel")}
                                </Button>
                                <FormSubmitButton
                                    form="edit-org-form"
                                    formState={editForm.formState}
                                    data-testid="save"
                                >
                                    {t("save")}
                                </FormSubmitButton>
                            </DialogFooter>
                        </DialogContent>
                    </FormProvider>
                </Dialog>

                <DataTable
                    key={key}
                    columns={columns}
                    data={organizations}
                    searchColumnId="name"
                    searchPlaceholder={t("searchOrganization")}
                    emptyMessage={t("emptyOrganizations")}
                    onRowClick={(row) => setEditOrg(row.original)}
                    toolbar={
                        <Button
                            type="button"
                            data-testid="addOrganization"
                            variant="default"
                            className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                            onClick={() => setCreateDialogOpen(true)}
                            aria-label={t("createOrganization")}
                        >
                            <Plus size={20} className="shrink-0 sm:hidden" />
                            <span className="hidden sm:inline">{t("createOrganization")}</span>
                        </Button>
                    }
                />
            </div>
        </>
    );
}
