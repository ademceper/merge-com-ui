import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { getErrorDescription, getErrorMessage, Action,
    KeycloakDataTable,
    useFetch,
    useHelp } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import { DotsThreeVertical, Question } from "@phosphor-icons/react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { GroupPickerDialog } from "../components/group/GroupPickerDialog";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { ListEmptyState } from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import { toUserFederation } from "../user-federation/routes/UserFederation";
import useToggle from "../utils/useToggle";
import { useAccess } from "../context/access/Access";

export const DefaultsGroupsTab = () => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const [isKebabOpen, toggleKebab] = useToggle();
    const [isGroupPickerOpen, toggleGroupPicker] = useToggle();
    const [defaultGroups, setDefaultGroups] = useState<GroupRepresentation[]>();
    const [selectedRows, setSelectedRows] = useState<GroupRepresentation[]>([]);

    const [key, setKey] = useState(0);
    const [load, setLoad] = useState(0);
    const reload = () => setLoad(load + 1);

    const { realm } = useRealm();
const { enabled } = useHelp();

    const { hasAccess } = useAccess();
    const canAddOrRemoveGroups = hasAccess("view-users", "manage-realm");

    useFetch(
        () => adminClient.realms.getDefaultGroups({ realm }),
        groups => {
            setDefaultGroups(groups);
            setKey(key + 1);
        },
        [load]
    );

    const loader = () => Promise.resolve(defaultGroups!);

    const removeGroup = async () => {
        try {
            await Promise.all(
                selectedRows.map(group =>
                    adminClient.realms.removeDefaultGroup({
                        realm,
                        id: group.id!
                    })
                )
            );
            toast.success(t("groupRemove", { count: selectedRows.length }));
            setSelectedRows([]);
        } catch (error) {
            toast.error(t("groupRemoveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
        reload();
    };

    const addGroups = async (groups: GroupRepresentation[]) => {
        try {
            await Promise.all(
                groups.map(group =>
                    adminClient.realms.addDefaultGroup({
                        realm,
                        id: group.id!
                    })
                )
            );
            toast.success(t("defaultGroupAdded", { count: groups.length }));
        } catch (error) {
            toast.error(t("defaultGroupAddedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
        reload();
    };

    const [toggleRemoveDialog, RemoveDialog] = useConfirmDialog({
        titleKey: t("removeConfirmTitle", { count: selectedRows.length }),
        messageKey: t("removeConfirm", { count: selectedRows.length }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: removeGroup
    });

    if (!defaultGroups) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <RemoveDialog />
            {isGroupPickerOpen && (
                <GroupPickerDialog
                    type="selectMany"
                    text={{
                        title: "addDefaultGroups",
                        ok: "add"
                    }}
                    onConfirm={async groups => {
                        await addGroups(groups || []);
                        toggleGroupPicker();
                    }}
                    onClose={toggleGroupPicker}
                />
            )}
            {enabled && (
                <Popover>
                    <PopoverTrigger asChild>
                        <div
                            className="keycloak__section_intro__help pl-6 cursor-pointer"
                        >
                            <p>
                                <Question className="size-4 inline" /> {t("whatIsDefaultGroups")}
                            </p>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Trans i18nKey="defaultGroupsHelp">
                            {" "}
                            <Link to={toUserFederation({ realm })} />.
                        </Trans>
                    </PopoverContent>
                </Popover>
            )}
            <KeycloakDataTable
                key={key}
                canSelectAll
                onSelect={rows => setSelectedRows([...rows])}
                loader={loader}
                ariaLabelKey="defaultGroups"
                searchPlaceholderKey="searchForGroups"
                toolbarItem={
                    canAddOrRemoveGroups && (
                        <>
                            <div>
                                <Button
                                    data-testid="openCreateGroupModal"
                                    onClick={toggleGroupPicker}
                                >
                                    {t("addGroups")}
                                </Button>
                            </div>
                            <div>
                                <DropdownMenu open={isKebabOpen} onOpenChange={toggleKebab}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            disabled={selectedRows!.length === 0}
                                        >
                                            <DotsThreeVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                toggleRemoveDialog();
                                                toggleKebab();
                                            }}
                                        >
                                            {t("remove")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </>
                    )
                }
                actions={
                    canAddOrRemoveGroups
                        ? [
                              {
                                  title: t("remove"),
                                  onRowClick: group => {
                                      setSelectedRows([group]);
                                      toggleRemoveDialog();
                                      return Promise.resolve(false);
                                  }
                              } as Action<GroupRepresentation>
                          ]
                        : []
                }
                columns={[
                    {
                        name: "name",
                        displayKey: "groupName"
                    },
                    {
                        name: "path",
                        displayKey: "path"
                    }
                ]}
                emptyState={
                    <ListEmptyState
                        hasIcon
                        message={t("noDefaultGroups")}
                        instructions={
                            <Trans i18nKey="noDefaultGroupsInstructions">
                                {" "}
                                <Link
                                    className="font-light"
                                    to={toUserFederation({ realm })}
                                    role="navigation"
                                    aria-label={t("identityBrokeringLink")}
                                />
                                Add groups...
                            </Trans>
                        }
                        primaryActionText={canAddOrRemoveGroups ? t("addGroups") : ""}
                        onPrimaryAction={toggleGroupPicker}
                    />
                }
            />
        </>
    );
};
