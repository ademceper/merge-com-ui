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
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow
} from "@merge-rd/ui/components/table";
import { DotsThree } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { findUser } from "@/admin/api/users";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toEditOrganization } from "@/admin/shared/lib/routes/organizations";
import type { UserParams } from "@/admin/shared/lib/routes/user";
import { toUsers } from "@/admin/shared/lib/routes/user";
import { useParams } from "@/admin/shared/lib/use-params";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { CheckboxFilterComponent } from "@/admin/shared/ui/dynamic/checkbox-filter-component";
import { SearchInputComponent } from "@/admin/shared/ui/dynamic/search-input-component";
import { OrganizationModal } from "../organizations/organization-modal";
import { useRemoveOrgMember, useAddOrgMember, useInviteToOrg } from "./hooks/use-org-membership";
import { useUserOrganizations } from "./hooks/use-user-organizations";

type OrganizationProps = {
    user: UserRepresentation;
};

type MembershipTypeRepresentation = OrganizationRepresentation & {
    membershipType?: (string | undefined)[];
};

export const Organizations = ({ user }: OrganizationProps) => {
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
    const { mutateAsync: removeOrgMemberMut } = useRemoveOrgMember(id!);
    const { mutateAsync: addOrgMemberMut } = useAddOrgMember(user.id!);
    const { mutateAsync: inviteToOrgMut } = useInviteToOrg(user.id!);
    const [isOpen, setIsOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

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
                await removeOrgMemberMut(selectedOrgs.map(org => org.id!));
                toast.success(t("organizationRemovedSuccess"));
                const foundUser = await findUser(id!);
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

    const filteredOrgs = useMemo(() => {
        if (!search) return userOrgs;
        const lower = search.toLowerCase();
        return userOrgs.filter((o: MembershipTypeRepresentation) =>
            o.name?.toLowerCase().includes(lower)
        );
    }, [userOrgs, search]);

    const totalCount = filteredOrgs.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedOrgs = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredOrgs.slice(start, start + pageSize);
    }, [filteredOrgs, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

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

    const colCount = 6;

    return (
        <>
            {openOrganizationPicker && (
                <OrganizationModal
                    isJoin={shouldJoin}
                    existingOrgs={userOrgs}
                    onClose={() => setOpenOrganizationPicker(false)}
                    onAdd={async orgs => {
                        try {
                            if (shouldJoin) {
                                await addOrgMemberMut(orgs.map(org => org.id!));
                            } else {
                                await Promise.all(
                                    orgs.map(org => {
                                        const formData = new FormData();
                                        formData.append("id", id!);
                                        return inviteToOrgMut({ orgId: org.id!, formData });
                                    })
                                );
                            }
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

            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("searchMembers")}
                        />
                        <SearchInputComponent
                            value={searchText}
                            placeholder={t("searchMembers")}
                            onChange={handleChange}
                            onSearch={handleSearch}
                            onClear={clearInput}
                            aria-label={t("searchMembers")}
                        />
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
                    <div className="flex items-center gap-2">
                        <DropdownMenu open={joinToggle} onOpenChange={setJoinToggle}>
                            <DropdownMenuTrigger asChild>
                                <Button id="toggle-id" size="sm">
                                    {t("joinOrganization")}
                                </Button>
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
                            size="sm"
                            disabled={selectedOrgs.length === 0}
                            onClick={() => toggleDeleteDialog()}
                        >
                            {t("remove")}
                        </Button>
                    </div>
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[5%]" />
                            <TableHead className="w-[25%]">{t("name")}</TableHead>
                            <TableHead className="w-[20%]">{t("domains")}</TableHead>
                            <TableHead className="w-[20%]">{t("description")}</TableHead>
                            <TableHead className="w-[15%]">
                                {t("membershipType")}
                            </TableHead>
                            <TableHead className="w-[15%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedOrgs.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={colCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {filteredOrgs.length === 0 && userOrgs.length === 0
                                        ? emptyContent
                                        : t("emptyUserOrganizations")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedOrgs.map((org: MembershipTypeRepresentation) => (
                                <TableRow key={org.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedOrgs.some(
                                                o => o.id === org.id
                                            )}
                                            onCheckedChange={() => toggleSelect(org)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            to={
                                                toEditOrganization({
                                                    realm: realm!,
                                                    id: org.id!,
                                                    tab: "settings"
                                                }) as string
                                            }
                                            className="text-primary hover:underline truncate block"
                                        >
                                            {org.name}
                                            {!org.enabled && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-2"
                                                >
                                                    {t("disabled")}
                                                </Badge>
                                            )}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {org.domains?.map(dn => {
                                                const name =
                                                    typeof dn === "string"
                                                        ? dn
                                                        : (dn as { name?: string }).name;
                                                return name ? (
                                                    <Badge
                                                        key={name}
                                                        variant="secondary"
                                                    >
                                                        {name}
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {org.description ?? "-"}
                                    </TableCell>
                                    <TableCell>
                                        {org.membershipType
                                            ?.filter(Boolean)
                                            .join(", ") ?? "-"}
                                    </TableCell>
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm">
                                                    <DotsThree
                                                        weight="bold"
                                                        className="size-4"
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        setSelectedOrgs([org]);
                                                        toggleDeleteDialog();
                                                    }}
                                                >
                                                    {t("remove")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={colCount} className="p-0">
                                <TablePaginationFooter
                                    pageSize={pageSize}
                                    onPageSizeChange={setPageSize}
                                    onPreviousPage={() =>
                                        setCurrentPage(p => Math.max(0, p - 1))
                                    }
                                    onNextPage={() =>
                                        setCurrentPage(p =>
                                            Math.min(totalPages - 1, p + 1)
                                        )
                                    }
                                    hasPreviousPage={currentPage > 0}
                                    hasNextPage={currentPage < totalPages - 1}
                                    totalCount={totalCount}
                                />
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </>
    );
};
