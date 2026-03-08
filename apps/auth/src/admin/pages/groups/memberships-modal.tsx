import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
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
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import { Question } from "@phosphor-icons/react";
import { useState } from "react";
import { type ColumnDef, DataTable } from "@/admin/shared/ui/data-table";
import { useHelp } from "../../../shared/keycloak-ui-shared";
import { GroupPath } from "../../shared/ui/group/group-path";
import { useUserMemberships } from "./hooks/use-user-memberships";

type CredentialDataDialogProps = {
    user: UserRepresentation;
    onClose: () => void;
};

export const MembershipsModal = ({ user, onClose }: CredentialDataDialogProps) => {
    const { t } = useTranslation();
    const [isDirectMembership, setDirectMembership] = useState(true);
    const { enabled } = useHelp();

    const { data: groups = [] } = useUserMemberships(user.id!, isDirectMembership);

    const columns: ColumnDef<GroupRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("groupMembership"),
            cell: ({ row }) => row.original.name || "-"
        },
        {
            accessorKey: "path",
            header: t("path"),
            cell: ({ row }) => <GroupPath group={row.original} />
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("noGroupMemberships")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("noGroupMembershipsText")}</EmptyDescription>
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
            <DialogContent
                className="max-w-4xl"
                data-testid="showMembershipsDialog"
                showCloseButton={true}
            >
                <DialogHeader>
                    <DialogTitle>
                        {t("showMembershipsTitle", { username: user.username })}
                    </DialogTitle>
                </DialogHeader>
                <DataTable<GroupRepresentation>
                    columns={columns}
                    data={groups}
                    searchColumnId="name"
                    searchPlaceholder={t("searchGroup")}
                    emptyContent={emptyContent}
                    emptyMessage={t("noGroupMemberships")}
                    className="keycloak_user-section_groups-table"
                    toolbar={
                        <>
                            <div className="flex items-center gap-2 mt-2">
                                <Checkbox
                                    id="kc-direct-membership-checkbox"
                                    checked={isDirectMembership}
                                    onCheckedChange={() => {
                                        setDirectMembership(!isDirectMembership);
                                    }}
                                />
                                <label htmlFor="kc-direct-membership-checkbox">
                                    {t("directMembership")}
                                </label>
                            </div>
                            {enabled && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="link"
                                            className="kc-who-will-appear-button"
                                        >
                                            <Question className="size-4" />
                                            {t("whoWillAppearLinkTextUsers")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <div>{t("whoWillAppearPopoverTextUsers")}</div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </>
                    }
                />
                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end sm:gap-4">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0 sm:items-center">
                        <Button
                            id="modal-cancel"
                            data-testid="cancel"
                            variant="ghost"
                            className="h-9 min-h-9 w-full text-foreground sm:w-auto"
                            onClick={onClose}
                        >
                            {t("cancel")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
