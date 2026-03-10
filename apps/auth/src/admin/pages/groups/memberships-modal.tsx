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
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";
import { Question } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useHelp } from "@/shared/keycloak-ui-shared";
import { GroupPath } from "@/admin/shared/ui/group/group-path";
import { useUserMemberships } from "./hooks/use-user-memberships";

type CredentialDataDialogProps = {
    user: UserRepresentation;
    onClose: () => void;
};

export const MembershipsModal = ({ user, onClose }: CredentialDataDialogProps) => {
    const { t } = useTranslation();
    const [isDirectMembership, setDirectMembership] = useState(true);
    const { enabled } = useHelp();
    const [search, setSearch] = useState("");

    const { data: groups = [] } = useUserMemberships(user.id!, isDirectMembership);

    const filteredGroups = useMemo(() => {
        if (!search) return groups;
        const lower = search.toLowerCase();
        return groups.filter((g: GroupRepresentation) =>
            g.name?.toLowerCase().includes(lower)
        );
    }, [groups, search]);

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

    const colCount = 2;

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
                <div className="flex items-center gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchGroup")}
                    />
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
                </div>
                <Table className="table-fixed keycloak_user-section_groups-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50%]">
                                {t("groupMembership")}
                            </TableHead>
                            <TableHead className="w-[50%]">{t("path")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGroups.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={colCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {emptyContent}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredGroups.map((group: GroupRepresentation) => (
                                <TableRow key={group.id}>
                                    <TableCell>{group.name || "-"}</TableCell>
                                    <TableCell>
                                        <GroupPath group={group} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
