import type ClientProfileRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useFetch } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Checkbox } from "@merge/ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { DataTable, type ColumnDef } from "@merge/ui/components/table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { translationFormatter } from "../utils/translationFormatter";

type ClientProfile = ClientProfileRepresentation & {
    global: boolean;
};

export type AddClientProfileModalProps = {
    open: boolean;
    toggleDialog: () => void;
    onConfirm: (newReps: RoleRepresentation[]) => void;
    allProfiles: string[];
};

export const AddClientProfileModal = (props: AddClientProfileModalProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<ClientProfile[]>([]);
    const [tableProfiles, setTableProfiles] = useState<ClientProfile[] | undefined>(undefined);

    useFetch(
        () =>
            adminClient.clientPolicies.listProfiles({
                includeGlobalProfiles: true
            }),
        allProfiles => {
            const globalProfiles = (allProfiles.globalProfiles ?? []).map(p => ({
                id: p.name,
                ...p,
                global: true
            })) as ClientProfile[];
            const profiles = (allProfiles.profiles ?? []).map(p => ({
                ...p,
                global: false
            })) as ClientProfile[];
            setTableProfiles([...globalProfiles, ...profiles]);
        },
        []
    );

    const data = useMemo(
        () => (tableProfiles ?? []).filter(item => !props.allProfiles.includes(item.name!)),
        [tableProfiles, props.allProfiles]
    );

    const toggleSelect = (row: ClientProfile) => {
        setSelectedRows(prev =>
            prev.some(r => r.name === row.name)
                ? prev.filter(r => r.name !== row.name)
                : [...prev, row]
        );
    };

    const columns: ColumnDef<ClientProfile>[] = [
        {
            id: "select",
            header: "",
            size: 40,
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedRows.some(r => r.name === row.original.name)}
                    onCheckedChange={() => toggleSelect(row.original)}
                />
            )
        },
        {
            accessorKey: "name",
            header: t("clientProfileName"),
            cell: ({ row }) => (
                <>
                    {row.original.name}{" "}
                    {row.original.global && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300 ml-1">
                            {t("global")}
                        </Badge>
                    )}
                </>
            )
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => translationFormatter(t)(row.original.description) as string
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("noRoles")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("noRolesInstructions")}</EmptyDescription>
                <Button variant="default">{t("createRole")}</Button>
            </EmptyContent>
        </Empty>
    );

    if (tableProfiles === undefined) {
        return <KeycloakSpinner />;
    }

    return (
        <Dialog open={props.open} onOpenChange={(open) => { if (!open) props.toggleDialog(); }}>
            <DialogContent data-testid="addClientProfile" className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{t("addClientProfile")}</DialogTitle>
                </DialogHeader>
                <DataTable
                    columns={columns}
                    data={data}
                    searchColumnId="name"
                    searchPlaceholder={t("searchProfile")}
                    emptyContent={emptyContent}
                    emptyMessage={t("noRoles")}
                />
                <DialogFooter>
                    <Button
                        data-testid="add-client-profile-button"
                        disabled={selectedRows.length === 0}
                        onClick={() => {
                            props.toggleDialog();
                            props.onConfirm(selectedRows as unknown as RoleRepresentation[]);
                        }}
                    >
                        {t("add")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => props.toggleDialog()}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
