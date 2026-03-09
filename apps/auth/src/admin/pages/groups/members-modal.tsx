import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Label } from "@merge-rd/ui/components/label";
import { Info } from "@phosphor-icons/react";
import { useState } from "react";
import { type ColumnDef, DataTable } from "@/admin/shared/ui/data-table";
import { emptyFormatter } from "@/admin/shared/lib/util";
import { useAvailableUsers } from "./hooks/use-available-users";

type MemberModalProps = {
    /** Unique key for the query cache (e.g. groupId or orgId). */
    membersQueryKey: string;
    /** Function that returns the current members to exclude from the list. */
    fetchCurrentMembers: () => Promise<UserRepresentation[]>;
    onAdd: (users: UserRepresentation[]) => Promise<void>;
    onClose: () => void;
};

export const MemberModal = ({
    membersQueryKey,
    fetchCurrentMembers,
    onAdd,
    onClose
}: MemberModalProps) => {
    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<UserRepresentation[]>([]);

    const { data: users = [] } = useAvailableUsers(
        membersQueryKey,
        fetchCurrentMembers
    );

    const toggleSelect = (user: UserRepresentation) => {
        setSelectedRows(prev =>
            prev.some(u => u.id === user.id)
                ? prev.filter(u => u.id !== user.id)
                : [...prev, user]
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
        {
            accessorKey: "email",
            header: t("email"),
            cell: ({ row }) => emptyFormatter()(row.original.email) as string
        },
        {
            accessorKey: "lastName",
            header: t("lastName"),
            cell: ({ row }) => emptyFormatter()(row.original.lastName) as string
        },
        {
            accessorKey: "firstName",
            header: t("firstName"),
            cell: ({ row }) => emptyFormatter()(row.original.firstName) as string
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("noUsersFound")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("emptyInstructions")}</EmptyDescription>
            </EmptyContent>
        </Empty>
    );

    return (
        <Dialog
            open
            onOpenChange={open => {
                if (!open) onClose();
            }}
        >
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
