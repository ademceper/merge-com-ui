import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakDataTable,
    ListEmptyState } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { CheckboxFilterComponent } from "../components/dynamic/CheckboxFilterComponent";
import { SearchInputComponent } from "../components/dynamic/SearchInputComponent";
import { useRealm } from "../context/realm-context/RealmContext";
import { MemberModal } from "../groups/MembersModal";
import { toUser } from "../user/routes/User";
import { translationFormatter } from "../utils/translationFormatter";
import { useParams } from "../utils/useParams";
import useToggle from "../utils/useToggle";
import { EditOrganizationParams } from "./routes/EditOrganization";

type MembershipTypeRepresentation = UserRepresentation & {
    membershipType?: string;
};

const UserDetailLink = (user: any) => {
    const { realm } = useRealm();
    return (
        <Link to={toUser({ realm, id: user.id!, tab: "settings" })}>{user.username}</Link>
    );
};

export const Members = () => {
    const { t } = useTranslation();
    const { adminClient } = useAdminClient();
    const { id: orgId } = useParams<EditOrganizationParams>();
const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const [openAddMembers, toggleAddMembers] = useToggle();
    const [selectedMembers, setSelectedMembers] = useState<UserRepresentation[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [searchTriggerText, setSearchTriggerText] = useState<string>("");
    const [filteredMembershipTypes, setFilteredMembershipTypes] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const membershipOptions = [
        { value: "Managed", label: "Managed" },
        { value: "Unmanaged", label: "Unmanaged" }
    ];

    const onToggleClick = () => {
        setIsOpen(!isOpen);
    };

    const onSelect = (_event: any, value: string) => {
        if (filteredMembershipTypes.includes(value)) {
            setFilteredMembershipTypes(
                filteredMembershipTypes.filter(item => item !== value)
            );
        } else {
            setFilteredMembershipTypes([...filteredMembershipTypes, value]);
        }
        setIsOpen(false);
        refresh();
    };

    const loader = async (first?: number, max?: number) => {
        try {
            const membershipType =
                filteredMembershipTypes.length === 1
                    ? filteredMembershipTypes[0]
                    : undefined;

            const memberships: MembershipTypeRepresentation[] =
                await adminClient.organizations.listMembers({
                    orgId,
                    first,
                    max,
                    search: searchTriggerText,
                    membershipType
                });

            return memberships;
        } catch (error) {
            toast.error(t("organizationsMembersListError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            return [];
        }
    };

    const handleChange = (value: string) => {
        setSearchText(value);
    };

    const handleSearch = () => {
        setSearchTriggerText(searchText);
        refresh();
    };

    const clearInput = () => {
        setSearchText("");
        setSearchTriggerText("");
        refresh();
    };

    const removeMember = async (selectedMembers: UserRepresentation[]) => {
        try {
            await Promise.all(
                selectedMembers.map(user =>
                    adminClient.organizations.delMember({
                        orgId,
                        userId: user.id!
                    })
                )
            );
            toast.success(t("organizationUsersLeft", { count: selectedMembers.length }));
        } catch (error) {
            toast.error(t("organizationUsersLeftError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }

        refresh();
    };

    return (
        <>
            {openAddMembers && (
                <MemberModal
                    membersQuery={() => adminClient.organizations.listMembers({ orgId })}
                    onAdd={async selectedRows => {
                        try {
                            await Promise.all(
                                selectedRows.map(user =>
                                    adminClient.organizations.addMember({
                                        orgId,
                                        userId: `"${user.id!}"`
                                    })
                                )
                            );
                            toast.success(t("organizationUsersAdded", {
                                    count: selectedRows.length
                                }));
                        } catch (error) {
                            toast.error(t("organizationUsersAddedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                        }
                    }}
                    onClose={() => {
                        toggleAddMembers();
                        refresh();
                    }}
                />
            )}
            <KeycloakDataTable
                key={key}
                loader={loader}
                isPaginated
                ariaLabelKey="membersList"
                onSelect={members => setSelectedMembers([...members])}
                canSelectAll
                toolbarItem={
                    <>
                        <div>
                            <SearchInputComponent
                                value={searchText}
                                onChange={handleChange}
                                onSearch={handleSearch}
                                onClear={clearInput}
                                placeholder={t("searchMembers")}
                                aria-label={t("searchMembers")}
                            />
                        </div>
                        <div>
                            <Button variant="default" onClick={toggleAddMembers}>
                                {t("addMember")}
                            </Button>
                        </div>
                        <div>
                            <Button
                                variant="ghost"
                                disabled={selectedMembers.length === 0}
                                onClick={() => removeMember(selectedMembers)}
                            >
                                {t("removeMember")}
                            </Button>
                        </div>
                        <div>
                            <CheckboxFilterComponent
                                filterPlaceholderText={t("filterByMembershipType")}
                                isOpen={isOpen}
                                options={membershipOptions}
                                onOpenChange={nextOpen => setIsOpen(nextOpen)}
                                onToggleClick={onToggleClick}
                                onSelect={onSelect}
                                selectedItems={filteredMembershipTypes}
                                width={"260px"}
                            />
                        </div>
                    </>
                }
                actions={[
                    {
                        title: t("remove"),
                        onRowClick: async member => {
                            await removeMember([member]);
                        }
                    }
                ]}
                columns={[
                    {
                        name: "username",
                        cellRenderer: UserDetailLink
                    },
                    {
                        name: "email"
                    },
                    {
                        name: "firstName"
                    },
                    {
                        name: "lastName"
                    },
                    {
                        name: "membershipType",
                        cellFormatters: [translationFormatter(t)]
                    }
                ]}
                emptyState={
                    <ListEmptyState
                        message={t("emptyMembers")}
                        instructions={t("emptyMembersInstructions")}
                        secondaryActions={[
                            {
                                text: t("addRealmUser"),
                                onClick: toggleAddMembers
                            }
                        ]}
                    />
                }
                isSearching={
                    filteredMembershipTypes.length > 0 || searchTriggerText.length > 0
                }
            />
        </>
    );
};
