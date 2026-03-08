import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { differenceBy } from "lodash-es";
import { useState } from "react";
import { type ColumnDef, DataTable } from "@/admin/shared/ui/data-table";
import { useOrganizations } from "./hooks/use-organizations";

type OrganizationModalProps = {
    isJoin?: boolean;
    existingOrgs: OrganizationRepresentation[];
    onAdd: (orgs: OrganizationRepresentation[]) => Promise<void>;
    onClose: () => void;
};

export const OrganizationModal = ({
    isJoin = true,
    existingOrgs,
    onAdd,
    onClose
}: OrganizationModalProps) => {
    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<OrganizationRepresentation[]>([]);
    const { data: allOrgs = [] } = useOrganizations();
    const orgs = differenceBy(allOrgs, existingOrgs, "id");

    const toggleSelect = (org: OrganizationRepresentation) => {
        setSelectedRows(prev =>
            prev.some(o => o.id === org.id)
                ? prev.filter(o => o.id !== org.id)
                : [...prev, org]
        );
    };

    const columns: ColumnDef<OrganizationRepresentation>[] = [
        {
            id: "select",
            header: "",
            size: 40,
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedRows.some(o => o.id === row.original.id)}
                    onCheckedChange={() => toggleSelect(row.original)}
                />
            )
        },
        {
            accessorKey: "name",
            header: t("organizationName"),
            cell: ({ row }) => row.original.name
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => (
                <span className="truncate block">{row.original.description ?? ""}</span>
            )
        }
    ];

    return (
        <Dialog open onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isJoin ? t("joinOrganization") : t("sendInvitation")}
                    </DialogTitle>
                </DialogHeader>
                <DataTable
                    columns={columns}
                    data={orgs}
                    searchColumnId="name"
                    searchPlaceholder={t("searchOrganization")}
                    emptyMessage={t("noResults")}
                />
                <DialogFooter>
                    <Button data-testid="cancel" variant="ghost" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                    <Button
                        data-testid="join"
                        disabled={selectedRows.length === 0}
                        onClick={async () => {
                            await onAdd(selectedRows);
                            onClose();
                        }}
                    >
                        {isJoin ? t("join") : t("send")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
