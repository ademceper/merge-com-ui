import OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button } from "@merge-rd/ui/components/button";
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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@/admin/components/data-table";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { FormAccess } from "../components/form/FormAccess";
import { ViewHeader } from "../components/view-header/ViewHeader";
import helpUrls from "../help-urls";
import { useRealm } from "../context/realm-context/RealmContext";
import {
    OrganizationForm,
    OrganizationFormType,
    convertToOrg
} from "./OrganizationForm";
import { toEditOrganization } from "./routes/EditOrganization";

export default function OrganizationSection() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [organizations, setOrganizations] = useState<OrganizationRepresentation[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<OrganizationRepresentation>();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const createForm = useForm<OrganizationFormType>({ mode: "onChange" });

    useEffect(() => {
        if (createDialogOpen) {
            createForm.reset({});
        }
    }, [createDialogOpen]);

    useFetch(
        () => adminClient.organizations.find({ first: 0, max: 1000 }),
        (orgs) => setOrganizations(orgs),
        [key]
    );

    const onDeleteConfirm = async () => {
        if (!selectedOrg?.id) return;
        try {
            await adminClient.organizations.delById({ id: selectedOrg.id });
            toast.success(t("organizationDeletedSuccess"));
            setSelectedOrg(undefined);
            refresh();
        } catch (error) {
            toast.error(t("organizationDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const onCreateSave = async (org: OrganizationFormType) => {
        try {
            const organization = convertToOrg(org);
            await adminClient.organizations.create(organization);
            toast.success(t("organizationSaveSuccess"));
            setCreateDialogOpen(false);
            createForm.reset();
            refresh();
        } catch (error) {
            toast.error(t("organizationSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                        onClick={() => navigate(toEditOrganization({ realm, id: row.original.id!, tab: "settings" }))}
                    >
                        <PencilSimple className="size-4 shrink-0" />
                        {t("edit")}
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setSelectedOrg(row.original)}
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
            <div className="pt-4 pb-6 px-0">
                <AlertDialog open={!!selectedOrg} onOpenChange={(open) => !open && setSelectedOrg(undefined)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("organizationDelete")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("organizationDeleteConfirm")}</AlertDialogDescription>
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
                                <Button
                                    type="submit"
                                    form="create-org-form"
                                    data-testid="save"
                                    disabled={
                                        !createForm.formState.isValid ||
                                        !createForm.formState.isDirty ||
                                        createForm.formState.isLoading ||
                                        createForm.formState.isValidating ||
                                        createForm.formState.isSubmitting
                                    }
                                >
                                    {t("save")}
                                </Button>
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
                    onRowClick={(row) => navigate(toEditOrganization({ realm, id: row.original.id!, tab: "settings" }))}
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
