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
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Label } from "@merge-rd/ui/components/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";
import { Info } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
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
    const [search, setSearch] = useState("");

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

    const filteredUsers = useMemo(() => {
        if (!search) return users;
        const lower = search.toLowerCase();
        return users.filter(u => u.username?.toLowerCase().includes(lower));
    }, [users, search]);

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

    const colCount = 5;

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
                <div className="flex items-center gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchForUser")}
                    />
                </div>
                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[5%]" />
                            <TableHead className="w-[25%]">{t("username")}</TableHead>
                            <TableHead className="w-[25%]">{t("email")}</TableHead>
                            <TableHead className="w-[20%]">{t("lastName")}</TableHead>
                            <TableHead className="w-[25%]">{t("firstName")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={colCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {emptyContent}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRows.some(
                                                u => u.id === user.id
                                            )}
                                            onCheckedChange={() => toggleSelect(user)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {user.username}{" "}
                                        {!user.enabled && (
                                            <Label className="text-red-500">
                                                <Info className="size-4 inline mr-1" />
                                                {t("disabled")}
                                            </Label>
                                        )}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(user.email) as string}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(user.lastName) as string}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(user.firstName) as string}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
