import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useParams } from "../../shared/lib/useParams";
import useToggle from "../../shared/lib/useToggle";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { CheckboxFilterComponent } from "../../shared/ui/dynamic/checkbox-filter-component";
import { SearchInputComponent } from "../../shared/ui/dynamic/search-input-component";
import { OrganizationModal } from "../organizations/organization-modal";
import { toEditOrganization } from "../../shared/lib/routes/organizations";
import { useUserOrganizations } from "./api/use-user-organizations";
import type { UserParams } from "../../shared/lib/routes/user";
import { toUsers } from "../../shared/lib/routes/user";

type OrganizationProps = {
    user: UserRepresentation;
};

type MembershipTypeRepresentation = OrganizationRepresentation & {
    membershipType?: (string | undefined)[];
};

export const Organizations = ({ user }: OrganizationProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { id } = useParams<UserParams>();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const [joinToggle, setJoinToggle] = useToggle();
    const [shouldJoin, setShouldJoin] = useState(true);
    const [openOrganizationPicker, setOpenOrganizationPicker] = useState(false);
    const [selectedOrgs, setSelectedOrgs] = useState<OrganizationRepresentation[]>([]);
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

    const onSelect = (_event: unknown, value: string) => {
        if (filteredMembershipTypes.includes(value)) {
            setFilteredMembershipTypes(
                filteredMembershipTypes.filter(item => item !== value)
            );
        } else {
            setFilteredMembershipTypes([...filteredMembershipTypes, value]);
        }
        setIsOpen(false);
    };

    const { data: userOrgs = [], refetch: refreshOrgs } = useUserOrganizations(
        id!,
        user.username,
        {
            membershipTypes:
                filteredMembershipTypes.length > 0 ? filteredMembershipTypes : undefined,
            search: searchTriggerText || undefined
        }
    );
    const refresh = () => refreshOrgs();

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

    const toggleSelect = (org: OrganizationRepresentation) => {
        setSelectedOrgs(prev =>
            prev.some(o => o.id === org.id)
                ? prev.filter(o => o.id !== org.id)
                : [...prev, org]
        );
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "removeConfirmOrganizationTitle",
        messageKey: t("organizationRemoveConfirm", { count: selectedOrgs.length }),
        continueButtonLabel: "remove",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await Promise.all(
                    selectedOrgs.map(org =>
                        adminClient.organizations.delMember({
                            orgId: org.id!,
                            userId: id!
                        })
                    )
                );
                toast.success(t("organizationRemovedSuccess"));
                const foundUser = await adminClient.users.findOne({ id: id! });
                if (!foundUser) {
                    navigate({ to: toUsers({ realm: realm }) as string });
                }
                setSelectedOrgs([]);
                refresh();
            } catch (error) {
                toast.error(
                    t("organizationRemoveError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });

    const columns: ColumnDef<MembershipTypeRepresentation>[] = [
        {
            id: "select",
            header: "",
            size: 40,
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedOrgs.some(o => o.id === row.original.id)}
                    onCheckedChange={() => toggleSelect(row.original)}
                />
            )
        },
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => (
                <Link
                    to={
                        toEditOrganization({
                            realm: realm!,
                            id: row.original.id!,
                            tab: "settings"
                        }) as string
                    }
                    className="text-primary hover:underline truncate block"
                >
                    {row.original.name}
                    {!row.original.enabled && (
                        <Badge variant="secondary" className="ml-2">
                            {t("disabled")}
                        </Badge>
                    )}
                </Link>
            )
        },
        {
            accessorKey: "domains",
            header: t("domains"),
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.domains?.map(dn => {
                        const name =
                            typeof dn === "string" ? dn : (dn as { name?: string }).name;
                        return name ? (
                            <Badge key={name} variant="secondary">
                                {name}
                            </Badge>
                        ) : null;
                    })}
                </div>
            )
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => row.original.description ?? "-"
        },
        {
            accessorKey: "membershipType",
            header: t("membershipType"),
            cell: ({ row }) =>
                row.original.membershipType?.filter(Boolean).join(", ") ?? "-"
        },
        {
            id: "actions",
            header: "",
            size: 50,
            enableHiding: false,
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => {
                            setSelectedOrgs([row.original]);
                            toggleDeleteDialog();
                        }}
                    >
                        {t("remove")}
                    </button>
                </DataTableRowActions>
            )
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle className="text-base font-medium">
                    {t("emptyUserOrganizations")}
                </EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>
                    {t("emptyUserOrganizationsInstructions")}
                </EmptyDescription>
                <div className="flex flex-wrap justify-center gap-2">
                    <Button
                        variant="default"
                        onClick={() => {
                            setShouldJoin(true);
                            setOpenOrganizationPicker(true);
                        }}
                    >
                        {t("joinOrganization")}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShouldJoin(false);
                            setOpenOrganizationPicker(true);
                        }}
                    >
                        {t("sendInvitation")}
                    </Button>
                </div>
            </EmptyContent>
        </Empty>
    );

    return (
        <>
            {openOrganizationPicker && (
                <OrganizationModal
                    isJoin={shouldJoin}
                    existingOrgs={userOrgs}
                    onClose={() => setOpenOrganizationPicker(false)}
                    onAdd={async orgs => {
                        try {
                            await Promise.all(
                                orgs.map(org => {
                                    const form = new FormData();
                                    form.append("id", id!);
                                    return shouldJoin
                                        ? adminClient.organizations.addMember({
                                              orgId: org.id!,
                                              userId: `"${user.id!}"`
                                          })
                                        : adminClient.organizations.inviteExistingUser(
                                              { orgId: org.id! },
                                              form
                                          );
                                })
                            );
                            toast.success(
                                t(
                                    shouldJoin
                                        ? "userAddedOrganization"
                                        : "userInvitedOrganization",
                                    { count: orgs.length }
                                )
                            );
                            refresh();
                        } catch (error) {
                            toast.error(
                                t(
                                    shouldJoin
                                        ? "userAddedOrganizationError"
                                        : "userInvitedError",
                                    { error: getErrorMessage(error) }
                                ),
                                { description: getErrorDescription(error) }
                            );
                        }
                    }}
                />
            )}
            <DeleteConfirm />
            <DataTable<MembershipTypeRepresentation>
                columns={columns}
                data={userOrgs}
                searchColumnId="name"
                searchPlaceholder={t("searchMembers")}
                emptyContent={emptyContent}
                emptyMessage={t("emptyUserOrganizations")}
                toolbar={
                    <div className="flex flex-wrap items-center gap-2">
                        <SearchInputComponent
                            value={searchText}
                            placeholder={t("searchMembers")}
                            onChange={handleChange}
                            onSearch={handleSearch}
                            onClear={clearInput}
                            aria-label={t("searchMembers")}
                        />
                        <DropdownMenu open={joinToggle} onOpenChange={setJoinToggle}>
                            <DropdownMenuTrigger asChild>
                                <Button id="toggle-id">{t("joinOrganization")}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    key="join"
                                    onClick={() => {
                                        setShouldJoin(true);
                                        setOpenOrganizationPicker(true);
                                    }}
                                >
                                    {t("joinOrganization")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    key="invite"
                                    onClick={() => {
                                        setShouldJoin(false);
                                        setOpenOrganizationPicker(true);
                                    }}
                                >
                                    {t("sendInvite")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            data-testid="removeOrganization"
                            variant="secondary"
                            disabled={selectedOrgs.length === 0}
                            onClick={() => toggleDeleteDialog()}
                        >
                            {t("remove")}
                        </Button>
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
                }
            />
        </>
    );
};
