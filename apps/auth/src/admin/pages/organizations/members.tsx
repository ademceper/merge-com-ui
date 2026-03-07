import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useOrganizationMembers, useAddOrganizationMembers, useRemoveOrganizationMembers } from "./api/queries";
import { DataTable, DataTableRowActions } from "@/admin/shared/ui/data-table";
import { DropdownMenuItem } from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import { toast } from "sonner";
import { Button } from "@merge-rd/ui/components/button";
import { useState } from "react";
import { useTranslation } from "@merge-rd/i18n";
import { Link } from "@tanstack/react-router";
import { useAdminClient } from "../../app/admin-client";
import { CheckboxFilterComponent } from "../../shared/ui/dynamic/checkbox-filter-component";
import { SearchInputComponent } from "../../shared/ui/dynamic/search-input-component";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { MemberModal } from "../groups/members-modal";
import { toUser } from "../user/routes/user";
import { translationFormatter } from "../../shared/lib/translationFormatter";
import { useParams } from "../../shared/lib/useParams";
import useToggle from "../../shared/lib/useToggle";
import { EditOrganizationParams } from "./routes/edit-organization";

type MembershipTypeRepresentation = UserRepresentation & {
    membershipType?: string;
};

const UserDetailLink = (user: any) => {
    const { realm } = useRealm();
    return (
        <Link to={toUser({ realm, id: user.id!, tab: "settings" }) as string}>{user.username}</Link>
    );
};

export const Members = () => {
    const { t } = useTranslation();
    const { adminClient } = useAdminClient();
    const { id: orgId } = useParams<EditOrganizationParams>();
    const [openAddMembers, toggleAddMembers] = useToggle();
    const [selectedMembers, setSelectedMembers] = useState<UserRepresentation[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [searchTriggerText, setSearchTriggerText] = useState<string>("");
    const [filteredMembershipTypes, setFilteredMembershipTypes] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const membershipType = filteredMembershipTypes.length === 1 ? filteredMembershipTypes[0] : undefined;
    const { data: members = [] } = useOrganizationMembers(orgId, {
        search: searchTriggerText,
        membershipType
    });
    const addMembersMutation = useAddOrganizationMembers(orgId);
    const removeMembersMutation = useRemoveOrganizationMembers(orgId);

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
    };

    const handleChange = (value: string) => {
        setSearchText(value);
    };

    const handleSearch = () => {
        setSearchTriggerText(searchText);
    };

    const clearInput = () => {
        setSearchText("");
        setSearchTriggerText("");
    };

    const removeMember = async (selected: UserRepresentation[]) => {
        try {
            await removeMembersMutation.mutateAsync(selected.map(u => u.id!));
            toast.success(t("organizationUsersLeft", { count: selected.length }));
        } catch (error) {
            toast.error(t("organizationUsersLeftError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            {openAddMembers && (
                <MemberModal
                    membersQuery={() => adminClient.organizations.listMembers({ orgId })}
                    onAdd={async selectedRows => {
                        try {
                            await addMembersMutation.mutateAsync(selectedRows.map(u => u.id!));
                            toast.success(t("organizationUsersAdded", {
                                    count: selectedRows.length
                                }));
                        } catch (error) {
                            toast.error(t("organizationUsersAddedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                        }
                    }}
                    onClose={() => {
                        toggleAddMembers();
                    }}
                />
            )}
            <DataTable<MembershipTypeRepresentation>
                columns={[
                    {
                        id: "select",
                        header: "",
                        size: 40,
                        cell: ({ row }) => (
                            <Checkbox
                                checked={selectedMembers.some(s => s.id === row.original.id)}
                                onCheckedChange={() =>
                                    setSelectedMembers(prev =>
                                        prev.some(s => s.id === row.original.id)
                                            ? prev.filter(s => s.id !== row.original.id)
                                            : [...prev, row.original]
                                    )
                                }
                            />
                        )
                    },
                    { accessorKey: "username", header: t("name"), cell: ({ row }) => <UserDetailLink {...row.original} /> },
                    { accessorKey: "email", header: t("email"), cell: ({ getValue }) => (getValue() ?? "—") as string },
                    { accessorKey: "firstName", header: t("firstName"), cell: ({ getValue }) => (getValue() ?? "—") as string },
                    { accessorKey: "lastName", header: t("lastName"), cell: ({ getValue }) => (getValue() ?? "—") as string },
                    { accessorKey: "membershipType", header: t("membershipType"), cell: ({ row }) => translationFormatter(t)(row.original.membershipType) },
                    {
                        id: "actions",
                        cell: ({ row }) => (
                            <DataTableRowActions row={row}>
                                <DropdownMenuItem onClick={() => removeMember([row.original])} className="text-destructive">
                                    {t("remove")}
                                </DropdownMenuItem>
                            </DataTableRowActions>
                        )
                    }
                ]}
                data={members as MembershipTypeRepresentation[]}
                searchColumnId="username"
                searchPlaceholder={t("search")}
                emptyContent={
                    <Empty className="py-12">
                        <EmptyHeader><EmptyTitle>{t("emptyMembers")}</EmptyTitle></EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>{t("emptyMembersInstructions")}</EmptyDescription>
                            <Button variant="outline" className="mt-2" onClick={toggleAddMembers}>{t("addRealmUser")}</Button>
                        </EmptyContent>
                    </Empty>
                }
                emptyMessage={t("emptyMembers")}
                toolbar={
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
            />
        </>
    );
};
