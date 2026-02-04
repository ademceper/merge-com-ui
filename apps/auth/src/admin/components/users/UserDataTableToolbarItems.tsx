import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";
import { ArrowRight, DotsThreeVertical } from "@phosphor-icons/react";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAccess } from "../../context/access/Access";
import { SearchDropdown, SearchType } from "../../user/details/SearchFilter";
import DropdownPanel from "../dropdown-panel/DropdownPanel";
import { UserFilter } from "./UserDataTable";
import { UserDataTableAttributeSearchForm } from "./UserDataTableAttributeSearchForm";

type UserDataTableToolbarItemsProps = {
    searchDropdownOpen: boolean;
    setSearchDropdownOpen: (open: boolean) => void;
    realm: RealmRepresentation;
    hasSelectedRows: boolean;
    toggleDeleteDialog: () => void;
    toggleUnlockUsersDialog: () => void;
    goToCreate: () => void;
    searchType: SearchType;
    setSearchType: (searchType: SearchType) => void;
    searchUser: string;
    setSearchUser: (searchUser: string) => void;
    activeFilters: UserFilter;
    setActiveFilters: (activeFilters: UserFilter) => void;
    refresh: () => void;
    profile: UserProfileConfig;
    clearAllFilters: () => void;
    createAttributeSearchChips: () => ReactNode;
    searchUserWithAttributes: () => void;
};

export function UserDataTableToolbarItems({
    searchDropdownOpen,
    setSearchDropdownOpen,
    realm,
    hasSelectedRows,
    toggleDeleteDialog,
    toggleUnlockUsersDialog,
    goToCreate,
    searchType,
    setSearchType,
    searchUser,
    setSearchUser,
    activeFilters,
    setActiveFilters,
    refresh,
    profile,
    clearAllFilters,
    createAttributeSearchChips,
    searchUserWithAttributes
}: UserDataTableToolbarItemsProps) {
    const { t } = useTranslation();
    const [kebabOpen, setKebabOpen] = useState(false);

    const { hasAccess } = useAccess();

    // Only needs query-users access to attempt add/delete of users.
    // This is because the user could have fine-grained access to users
    // of a group.  There is no way to know this without searching the
    // permissions of every group.
    const isManager = hasAccess("query-users");

    const searchItem = () => {
        return (
            <div>
                <div className="flex gap-2">
                    <div>
                        <SearchDropdown
                            searchType={searchType}
                            onSelect={searchType => {
                                clearAllFilters();
                                setSearchType(searchType);
                            }}
                        />
                    </div>
                    {searchType === "default" && defaultSearchInput()}
                    {searchType === "attribute" && attributeSearchInput()}
                </div>
            </div>
        );
    };

    const defaultSearchInput = () => {
        return (
            <div>
                <Input
                    type="search"
                    data-testid="table-search-input"
                    placeholder={t("searchForUser")}
                    aria-label={t("search")}
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            const target = e.target as HTMLInputElement;
                            setSearchUser(target.value);
                            refresh();
                        }
                    }}
                />
            </div>
        );
    };

    const attributeSearchInput = () => {
        return (
            <>
                <DropdownPanel
                    data-testid="select-attributes-dropdown"
                    buttonText={t("selectAttributes")}
                    setSearchDropdownOpen={setSearchDropdownOpen}
                    searchDropdownOpen={searchDropdownOpen}
                    width="15vw"
                >
                    <UserDataTableAttributeSearchForm
                        activeFilters={activeFilters}
                        setActiveFilters={setActiveFilters}
                        profile={profile}
                        createAttributeSearchChips={createAttributeSearchChips}
                        clearAllFilters={clearAllFilters}
                        searchUserWithAttributes={() => {
                            searchUserWithAttributes();
                            setSearchDropdownOpen(false);
                        }}
                    />
                </DropdownPanel>
                <Button
                    variant="outline"
                    onClick={() => {
                        searchUserWithAttributes();
                        setSearchDropdownOpen(false);
                    }}
                    aria-label={t("searchAttributes")}
                >
                    <ArrowRight className="size-4" />
                </Button>
            </>
        );
    };

    const bruteForceProtectionToolbarItem = !realm.bruteForceProtected ? (
        <div>
            <Button
                variant="link"
                onClick={toggleDeleteDialog}
                data-testid="delete-user-btn"
                disabled={hasSelectedRows}
            >
                {t("deleteUser")}
            </Button>
        </div>
    ) : (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        onClick={() => setKebabOpen(!kebabOpen)}
                    >
                        <DotsThreeVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        key="deleteUser"
                        disabled={hasSelectedRows}
                        onClick={() => {
                            toggleDeleteDialog();
                            setKebabOpen(false);
                        }}
                    >
                        {t("deleteUser")}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        key="unlock"
                        onClick={() => {
                            toggleUnlockUsersDialog();
                            setKebabOpen(false);
                        }}
                    >
                        {t("unlockAllUsers")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    const actionItems = (
        <>
            <div>
                <Button data-testid="add-user" onClick={goToCreate}>
                    {t("addUser")}
                </Button>
            </div>
            {bruteForceProtectionToolbarItem}
        </>
    );

    return (
        <>
            {searchItem()}
            {isManager ? actionItems : null}
        </>
    );
}
