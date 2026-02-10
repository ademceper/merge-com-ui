import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakSpinner, useFetch } from "../../../shared/keycloak-ui-shared";
import { DataTable, DataTableRowActions, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Label } from "@merge/ui/components/label";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@merge/ui/components/tooltip";
import { WarningCircle, Info, Warning } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { fetchRealmInfo } from "../../context/auth/admin-ui-endpoint";
import { UiRealmInfo } from "../../context/auth/uiRealmInfo";
import { useRealm } from "../../context/realm-context/RealmContext";
import { SearchType } from "../../user/details/SearchFilter";
import { toAddUser } from "../../user/routes/AddUser";
import { toUser } from "../../user/routes/User";
import { emptyFormatter } from "../../util";
import { useConfirmDialog } from "../confirm-dialog/ConfirmDialog";
import { BruteUser, findUsers } from "../role-mapping/resource";
import { UserDataTableToolbarItems } from "./UserDataTableToolbarItems";
import { NetworkError } from "@keycloak/keycloak-admin-client";

export type UserFilter = {
    exact: boolean;
    userAttribute: UserAttribute[];
};

export type UserAttribute = {
    name: string;
    displayName: string;
    value: string;
};

const UserDetailLink = (user: BruteUser) => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    return (
        <>
            <Link to={toUser({ realm, id: user.id!, tab: "settings" })}>
                {user.username}
                <StatusRow user={user} />
            </Link>
            {user.attributes?.["is_temporary_admin"]?.[0] === "true" && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Warning
                                className="size-4 ml-1 inline"
                                id="temporary-admin-label"
                            />
                        </TooltipTrigger>
                        <TooltipContent>{t("temporaryAdmin")}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </>
    );
};

type StatusRowProps = {
    user: BruteUser;
};

const StatusRow = ({ user }: StatusRowProps) => {
    const { t } = useTranslation();
    return (
        <>
            {!user.enabled && (
                <Label className="text-red-600 inline-flex items-center gap-1">
                    <Info className="size-4" />
                    {t("disabled")}
                </Label>
            )}
            {user.bruteForceStatus?.disabled && (
                <Label className="text-orange-600 inline-flex items-center gap-1">
                    <Warning className="size-4" />
                    {t("temporaryLocked")}
                </Label>
            )}
        </>
    );
};

const ValidatedEmail = (user: UserRepresentation) => {
    const { t } = useTranslation();
    return (
        <>
            {!user.emailVerified && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <WarningCircle className="size-4 keycloak__user-section__email-verified inline" />
                        </TooltipTrigger>
                        <TooltipContent>{t("notVerified")}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}{" "}
            {emptyFormatter()(user.email)}
        </>
    );
};

export function UserDataTable() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const { realm: realmName, realmRepresentation: realm } = useRealm();
    const navigate = useNavigate();
    const [uiRealmInfo, setUiRealmInfo] = useState<UiRealmInfo>({});
    const [searchUser, setSearchUser] = useState("");
    const [selectedRows, setSelectedRows] = useState<UserRepresentation[]>([]);
    const [searchType, setSearchType] = useState<SearchType>("default");
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<UserFilter>({
        exact: false,
        userAttribute: []
    });
    const [profile, setProfile] = useState<UserProfileConfig>({});
    const [query, setQuery] = useState("");

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    useFetch(
        async () => {
            try {
                return await Promise.all([
                    fetchRealmInfo(adminClient),
                    adminClient.users.getProfile()
                ]);
            } catch (error) {
                if (error instanceof NetworkError && error?.response?.status === 403) {
                    // "User Profile" attributes not available for Users Attribute search, when admin user does not have view- or manage-realm realm-management role
                    return [{}, {}] as [UiRealmInfo, UserProfileConfig];
                } else {
                    throw error;
                }
            }
        },
        ([uiRealmInfo, profile]) => {
            setUiRealmInfo(uiRealmInfo);
            setProfile(profile);
        },
        []
    );

    const [users, setUsers] = useState<UserRepresentation[]>([]);

    useFetch(
        async () => {
            if (!listUsers && !searchUser && !query) return [];
            const params: { [name: string]: string | number | boolean } = {
                first: 0,
                max: 500,
                q: query,
                briefRepresentation: true
            };
            if (searchUser) params.search = searchUser;
            if (activeFilters.exact) params.exact = true;
            try {
                return await findUsers(adminClient, params);
            } catch (error) {
                if (uiRealmInfo.userProfileProvidersEnabled) {
                    toast.error(t("noUsersFoundErrorStorage", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                } else {
                    toast.error(t("noUsersFoundError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                }
                return [];
            }
        },
        setUsers,
        [key, query, searchUser, activeFilters.exact]
    );

    const [toggleUnlockUsersDialog, UnlockUsersConfirm] = useConfirmDialog({
        titleKey: "unlockAllUsers",
        messageKey: "unlockUsersConfirm",
        continueButtonLabel: "unlock",
        onConfirm: async () => {
            try {
                await adminClient.attackDetection.delAll();
                refresh();
                toast.success(t("unlockUsersSuccess"));
            } catch (error) {
                toast.error(t("unlockUsersError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteConfirmUsers", {
            count: selectedRows.length,
            name: selectedRows[0]?.username
        }),
        messageKey: t("deleteConfirmDialog", { count: selectedRows.length }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                for (const user of selectedRows) {
                    await adminClient.users.del({ id: user.id! });
                }
                setSelectedRows([]);
                clearAllFilters();
                toast.success(t("userDeletedSuccess"));
            } catch (error) {
                toast.error(t("userDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const goToCreate = () => navigate(toAddUser({ realm: realmName }));

    if (uiRealmInfo.userProfileProvidersEnabled === undefined || !realm) {
        return <KeycloakSpinner />;
    }

    //should *only* list users when no user federation is configured
    const listUsers = !uiRealmInfo.userProfileProvidersEnabled;

    const clearAllFilters = () => {
        setActiveFilters({ exact: false, userAttribute: [] });
        setSearchUser("");
        setQuery("");
        refresh();
    };

    const createQueryString = (filters: UserFilter) => {
        return filters.userAttribute
            .map(filter => `${filter.name}:${filter.value}`)
            .join(" ");
    };

    const searchUserWithAttributes = () => {
        const attributes = createQueryString(activeFilters);
        setQuery(attributes);
        refresh();
    };

    const createAttributeSearchChips = () => {
        return (
            <div className="mt-2 mr-2 flex flex-wrap gap-1">
                {activeFilters.userAttribute.length > 0 &&
                    Object.values(activeFilters.userAttribute).map(entry => {
                        const categoryName =
                            entry.displayName.length ? entry.displayName : entry.name;
                        return (
                            <Badge
                                key={entry.name}
                                variant="secondary"
                                data-testid="user-attribute-search-chips-group"
                                className="cursor-pointer gap-1 py-1 pr-1"
                                onClick={event => {
                                    event.stopPropagation();
                                    const filtered = activeFilters.userAttribute.filter(
                                        chip => chip.name !== entry.name
                                    );
                                    setActiveFilters({
                                        userAttribute: filtered,
                                        exact: activeFilters.exact
                                    });
                                    setQuery(createQueryString({ userAttribute: filtered, exact: activeFilters.exact }));
                                    refresh();
                                }}
                            >
                                <span className="font-medium">{categoryName}:</span> {entry.value}
                            </Badge>
                        );
                    })}
            </div>
        );
    };

    const toolbar = () => {
        return (
            <UserDataTableToolbarItems
                searchDropdownOpen={searchDropdownOpen}
                setSearchDropdownOpen={setSearchDropdownOpen}
                realm={realm}
                hasSelectedRows={selectedRows.length === 0}
                toggleDeleteDialog={toggleDeleteDialog}
                toggleUnlockUsersDialog={toggleUnlockUsersDialog}
                goToCreate={goToCreate}
                searchType={searchType}
                setSearchType={setSearchType}
                searchUser={searchUser}
                setSearchUser={setSearchUser}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                refresh={refresh}
                profile={profile}
                clearAllFilters={clearAllFilters}
                createAttributeSearchChips={createAttributeSearchChips}
                searchUserWithAttributes={searchUserWithAttributes}
            />
        );
    };

    const subtoolbar = () => {
        if (!activeFilters.userAttribute.length) {
            return;
        }
        return (
            <div className="user-attribute-search-form-subtoolbar">
                <div>{createAttributeSearchChips()}</div>
                <div>
                    <Button
                        variant="link"
                        onClick={() => {
                            clearAllFilters();
                        }}
                    >
                        {t("clearAllFilters")}
                    </Button>
                </div>
            </div>
        );
    };

    const columns: ColumnDef<UserRepresentation>[] = [
        {
            id: "select",
            header: "",
            size: 40,
            cell: ({ row }) =>
                row.original.access?.manage !== false ? (
                    <Checkbox
                        checked={selectedRows.some(s => s.id === row.original.id)}
                        onCheckedChange={() =>
                            setSelectedRows(prev =>
                                prev.some(s => s.id === row.original.id)
                                    ? prev.filter(s => s.id !== row.original.id)
                                    : [...prev, row.original]
                            )
                        }
                    />
                ) : null
        },
        { accessorKey: "username", header: t("username"), cell: ({ row }) => <UserDetailLink {...row.original} /> },
        { accessorKey: "email", header: t("email"), cell: ({ row }) => <ValidatedEmail {...row.original} /> },
        { accessorKey: "lastName", header: t("lastName"), cell: ({ getValue }) => emptyFormatter()(getValue()) },
        { accessorKey: "firstName", header: t("firstName"), cell: ({ getValue }) => emptyFormatter()(getValue()) },
        {
            id: "actions",
            cell: ({ row }) =>
                row.original.access?.manage ? (
                    <DataTableRowActions row={row}>
                        <DropdownMenuItem onClick={() => { setSelectedRows([row.original]); toggleDeleteDialog(); }} className="text-destructive">
                            {t("delete")}
                        </DropdownMenuItem>
                    </DataTableRowActions>
                ) : null
        }
    ];

    const emptyContent = !listUsers ? (
        <>
            <div className="flex items-center gap-2 p-4">{toolbar()}</div>
            <div data-testid="empty-state" className="p-8 text-center">
                <div className="kc-search-users-text"><p>{t("searchForUserDescription")}</p></div>
            </div>
        </>
    ) : (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t("noUsersFound")}</EmptyTitle></EmptyHeader>
            <EmptyContent><EmptyDescription>{t("emptyInstructions")}</EmptyDescription></EmptyContent>
            <Button className="mt-2" onClick={goToCreate}>{t("createNewUser")}</Button>
        </Empty>
    );

    return (
        <>
            <DeleteConfirm />
            <UnlockUsersConfirm />
            {subtoolbar()}
            <DataTable<UserRepresentation>
                key={key}
                columns={columns}
                data={users}
                searchColumnId="username"
                searchPlaceholder={t("searchUsers")}
                emptyContent={emptyContent}
                emptyMessage={t("noUsersFound")}
                toolbar={toolbar()}
            />
        </>
    );
}
