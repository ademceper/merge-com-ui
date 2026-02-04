import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { Question } from "@phosphor-icons/react";
import { useHelp } from "../../shared/keycloak-ui-shared";
import { ListEmptyState } from "../../shared/keycloak-ui-shared";
import { KeycloakDataTable } from "../../shared/keycloak-ui-shared";
import { sortBy, uniqBy } from "lodash-es";
import { useState } from "react";
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
    const alphabetize = (groupsList: GroupRepresentation[]) => {
        return sortBy(groupsList, group => group.path?.toUpperCase());
    };

    const loader = async (first?: number, max?: number, search?: string) => {
        const params: { [name: string]: string | number } = {
            first: first!,
            max: max!
        };

        const searchParam = search || "";
        if (searchParam) {
            params.search = searchParam;
        }

        const joinedUserGroups = await adminClient.users.listGroups({
            ...params,
            id: user.id!
        });

        const indirect: GroupRepresentation[] = [];
        if (!isDirectMembership)
            joinedUserGroups.forEach(g => {
                const paths = (g.path?.substring(1).match(/((~\/)|[^/])+/g) || []).slice(
                    0,
                    -1
                );

                indirect.push(
                    ...paths.map(p => ({
                        name: p,
                        path: g.path?.substring(0, g.path.indexOf(p) + p.length)
                    }))
                );
            });

        return alphabetize(uniqBy([...joinedUserGroups, ...indirect], "path"));
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-4xl" data-testid="showMembershipsDialog">
                <DialogHeader>
                    <DialogTitle>{t("showMembershipsTitle", { username: user.username })}</DialogTitle>
                </DialogHeader>
                <KeycloakDataTable
                    key={key}
                    loader={loader}
                    className="keycloak_user-section_groups-table"
                    isPaginated
                    ariaLabelKey="roleList"
                    searchPlaceholderKey="searchGroup"
                    toolbarItem={
                        <>
                            <div className="flex items-center gap-2 mt-2">
                                <Checkbox
                                    id="kc-direct-membership-checkbox"
                                    checked={isDirectMembership}
                                    onCheckedChange={() => {
                                        setDirectMembership(!isDirectMembership);
                                        refresh();
                                    }}
                                />
                                <label htmlFor="kc-direct-membership-checkbox">{t("directMembership")}</label>
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
                    columns={[
                        {
                            name: "groupMembership",
                            displayKey: "groupMembership",
                            cellRenderer: (group: GroupRepresentation) => group.name || "-"
                        },
                        {
                            name: "path",
                            displayKey: "path",
                            cellRenderer: (group: GroupRepresentation) => (
                                <GroupPath group={group} />
                            )
                        }
                    ]}
                    emptyState={
                        <ListEmptyState
                            hasIcon
                            message={t("noGroupMemberships")}
                            instructions={t("noGroupMembershipsText")}
                        />
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
