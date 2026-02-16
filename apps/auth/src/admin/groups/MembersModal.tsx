import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@merge/ui/components/dialog";
import { Label } from "@merge/ui/components/label";
import { DataTable, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { Info } from "@phosphor-icons/react";
import { differenceBy } from "lodash-es";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { emptyFormatter } from "../util";

type MemberModalProps = {
    membersQuery: (first?: number, max?: number) => Promise<UserRepresentation[]>;
    onAdd: (users: UserRepresentation[]) => Promise<void>;
    onClose: () => void;
};

export const MemberModal = ({ membersQuery, onAdd, onClose }: MemberModalProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<UserRepresentation[]>([]);
    const [users, setUsers] = useState<UserRepresentation[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const members = await membersQuery(0, 100);
                const found = await adminClient.users.find({ first: 0, max: 500, search: "" });
                const available = differenceBy(found, members, "id").slice(0, 100);
                if (!cancelled) setUsers(available);
            } catch (error) {
                if (!cancelled) {
                    toast.error(t("noUsersFoundError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                    setUsers([]);
                }
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const toggleSelect = (user: UserRepresentation) => {
        setSelectedRows(prev =>
            prev.some(u => u.id === user.id) ? prev.filter(u => u.id !== user.id) : [...prev, user]
        );
    };

    const columns: ColumnDef<UserRepresentation>[] = [
        {
            id: "select",
            header: "",
            size: 40,
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedRows.some(u => u.id === row.original.id)}
                    onCheckedChange={() => toggleSelect(row.original)}
                />
            )
        },
        {
            accessorKey: "username",
            header: t("username"),
            cell: ({ row }) => (
                <>
                    {row.original.username}{" "}
                    {!row.original.enabled && (
                        <Label className="text-red-500">
                            <Info className="size-4 inline mr-1" />
                            {t("disabled")}
                        </Label>
                    )}
                </>
            )
        },
        { accessorKey: "email", header: t("email"), cell: ({ row }) => emptyFormatter()(row.original.email) as string },
        { accessorKey: "lastName", header: t("lastName"), cell: ({ row }) => emptyFormatter()(row.original.lastName) as string },
        { accessorKey: "firstName", header: t("firstName"), cell: ({ row }) => emptyFormatter()(row.original.firstName) as string }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t("noUsersFound")}</EmptyTitle></EmptyHeader>
            <EmptyContent><EmptyDescription>{t("emptyInstructions")}</EmptyDescription></EmptyContent>
        </Empty>
    );

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-4xl" showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{t("addMember")}</DialogTitle>
                </DialogHeader>
                <DataTable<UserRepresentation>
                    columns={columns}
                    data={users}
                    searchColumnId="username"
                    searchPlaceholder={t("searchForUser")}
                    emptyContent={emptyContent}
                    emptyMessage={t("noUsersFound")}
                />
                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end sm:gap-4">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0 sm:items-center">
                        <DialogClose asChild>
                            <Button
                                data-testid="cancel"
                                variant="ghost"
                                className="h-9 min-h-9 w-full text-foreground sm:w-auto"
                                onClick={onClose}
                            >
                                {t("cancel")}
                            </Button>
                        </DialogClose>
                        <Button
                            data-testid="add"
                            variant="default"
                            disabled={selectedRows.length === 0}
                            className="h-9 min-h-9 w-full sm:w-auto"
                            onClick={async () => {
                                await onAdd(selectedRows);
                                onClose();
                            }}
                        >
                            {t("add")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
