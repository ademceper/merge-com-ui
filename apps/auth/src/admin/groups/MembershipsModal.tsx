import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { Question } from "@phosphor-icons/react";
import { useHelp } from "../../shared/keycloak-ui-shared";
import { useFetch } from "../../shared/keycloak-ui-shared";
import { sortBy, uniqBy } from "lodash-es";
import { useState } from "react";
import { DataTable, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { GroupPath } from "../components/group/GroupPath";

type CredentialDataDialogProps = {
    user: UserRepresentation;
    onClose: () => void;
};

export const MembershipsModal = ({ user, onClose }: CredentialDataDialogProps) => {
    const { t } = useTranslation();
    const { adminClient } = useAdminClient();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const [isDirectMembership, setDirectMembership] = useState(true);
    const { enabled } = useHelp();
    const [groups, setGroups] = useState<GroupRepresentation[]>([]);

    useFetch(
        async () => {
            const joinedUserGroups = await adminClient.users.listGroups({ id: user.id!, first: 0, max: 500 });
            const indirect: GroupRepresentation[] = [];
            if (!isDirectMembership) {
                joinedUserGroups.forEach(g => {
                    const paths = (g.path?.substring(1).match(/((~\/)|[^/])+/g) || []).slice(0, -1);
                    indirect.push(...paths.map(p => ({ name: p, path: g.path?.substring(0, g.path!.indexOf(p) + p.length) } as GroupRepresentation)));
                });
            }
            return sortBy(uniqBy([...joinedUserGroups, ...indirect], "path"), group => group.path?.toUpperCase());
        },
        setGroups,
        [key, isDirectMembership]
    );

    const columns: ColumnDef<GroupRepresentation>[] = [
        { accessorKey: "name", header: t("groupMembership"), cell: ({ row }) => row.original.name || "-" },
        { accessorKey: "path", header: t("path"), cell: ({ row }) => <GroupPath group={row.original} /> }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t("noGroupMemberships")}</EmptyTitle></EmptyHeader>
            <EmptyContent><EmptyDescription>{t("noGroupMembershipsText")}</EmptyDescription></EmptyContent>
        </Empty>
    );

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-4xl" data-testid="showMembershipsDialog">
                <DialogHeader>
                    <DialogTitle>{t("showMembershipsTitle", { username: user.username })}</DialogTitle>
                </DialogHeader>
                <DataTable<GroupRepresentation>
                    key={key}
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
                                    onCheckedChange={() => { setDirectMembership(!isDirectMembership); refresh(); }}
                                />
                                <label htmlFor="kc-direct-membership-checkbox">{t("directMembership")}</label>
                            </div>
                            {enabled && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="link" className="kc-who-will-appear-button">
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
                <DialogFooter>
                    <Button
                        id="modal-cancel"
                        data-testid="cancel"
                        variant="default"
                        onClick={onClose}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
