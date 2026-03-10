import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "@merge-rd/i18n";
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
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import type { EditOrganizationParams } from "@/admin/shared/lib/routes/organizations";
import { toUser } from "@/admin/shared/lib/routes/user";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import { useParams } from "@/admin/shared/lib/use-params";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { CheckboxFilterComponent } from "@/admin/shared/ui/dynamic/checkbox-filter-component";
import { SearchInputComponent } from "@/admin/shared/ui/dynamic/search-input-component";
import { MemberModal } from "../groups/members-modal";
import { useAddOrganizationMembers } from "./hooks/use-add-organization-members";
import { useOrganizationMembers } from "./hooks/use-organization-members";
import { useRemoveOrganizationMembers } from "./hooks/use-remove-organization-members";

type MembershipTypeRepresentation = UserRepresentation & {
    membershipType?: string;
};

const UserDetailLink = (user: any) => {
    const { realm } = useRealm();
    return (
        <Link to={toUser({ realm, id: user.id!, tab: "settings" }) as string}>
            {user.username}
        </Link>
    );
};

const COLUMN_COUNT = 7;

export const Members = () => {
    const { t } = useTranslation();
    const { id: orgId } = useParams<EditOrganizationParams>();
    const [openAddMembers, toggleAddMembers] = useToggle();
    const [selectedMembers, setSelectedMembers] = useState<UserRepresentation[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [searchTriggerText, setSearchTriggerText] = useState<string>("");
    const [filteredMembershipTypes, setFilteredMembershipTypes] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const membershipType =
        filteredMembershipTypes.length === 1 ? filteredMembershipTypes[0] : undefined;
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
            toast.error(
                t("organizationUsersLeftError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const filteredMembers = useMemo(() => {
        if (!search) return members as MembershipTypeRepresentation[];
        const lower = search.toLowerCase();
        return (members as MembershipTypeRepresentation[]).filter(m =>
            m.username?.toLowerCase().includes(lower)
        );
    }, [members, search]);

    const totalCount = filteredMembers.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedMembers = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredMembers.slice(start, start + pageSize);
    }, [filteredMembers, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    return (
        <>
            {openAddMembers && (
                <MemberModal
                    membersQueryKey={`org-${orgId}`}
                    fetchCurrentMembers={() =>
                        import("../../api/organizations").then(m =>
                            m.fetchOrganizationMembers(orgId)
                        )
                    }
                    onAdd={async selectedRows => {
                        try {
                            await addMembersMutation.mutateAsync(
                                selectedRows.map(u => u.id!)
                            );
                            toast.success(
                                t("organizationUsersAdded", {
                                    count: selectedRows.length
                                })
                            );
                        } catch (error) {
                            toast.error(
                                t("organizationUsersAddedError", {
                                    error: getErrorMessage(error)
                                }),
                                { description: getErrorDescription(error) }
                            );
                        }
                    }}
                    onClose={() => {
                        toggleAddMembers();
                    }}
                />
            )}
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <SearchInputComponent
                            value={searchText}
                            onChange={handleChange}
                            onSearch={handleSearch}
                            onClear={clearInput}
                            placeholder={t("searchMembers")}
                            aria-label={t("searchMembers")}
                        />
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("searchMembers")}
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
                        <Button variant="default" onClick={toggleAddMembers}>
                            {t("addMember")}
                        </Button>
                        <Button
                            variant="ghost"
                            disabled={selectedMembers.length === 0}
                            onClick={() => removeMember(selectedMembers)}
                        >
                            {t("removeMember")}
                        </Button>
                    </div>
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10" />
                            <TableHead className="w-[20%]">{t("name")}</TableHead>
                            <TableHead className="w-[20%]">{t("email")}</TableHead>
                            <TableHead className="w-[15%]">{t("firstName")}</TableHead>
                            <TableHead className="w-[15%]">{t("lastName")}</TableHead>
                            <TableHead className="w-[15%]">
                                {t("membershipType")}
                            </TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedMembers.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={COLUMN_COUNT}
                                    className="text-center text-muted-foreground"
                                >
                                    {members.length === 0 ? (
                                        <Empty className="py-12">
                                            <EmptyHeader>
                                                <EmptyTitle>
                                                    {t("emptyMembers")}
                                                </EmptyTitle>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <EmptyDescription>
                                                    {t("emptyMembersInstructions")}
                                                </EmptyDescription>
                                                <Button
                                                    variant="outline"
                                                    className="mt-2"
                                                    onClick={toggleAddMembers}
                                                >
                                                    {t("addRealmUser")}
                                                </Button>
                                            </EmptyContent>
                                        </Empty>
                                    ) : (
                                        t("emptyMembers")
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedMembers.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedMembers.some(
                                                s => s.id === member.id
                                            )}
                                            onCheckedChange={() =>
                                                setSelectedMembers(prev =>
                                                    prev.some(s => s.id === member.id)
                                                        ? prev.filter(
                                                              s => s.id !== member.id
                                                          )
                                                        : [...prev, member]
                                                )
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="truncate">
                                        <UserDetailLink {...member} />
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {member.email ?? "\u2014"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {member.firstName ?? "\u2014"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {member.lastName ?? "\u2014"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {translationFormatter(t)(member.membershipType)}
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
                                                    onClick={() =>
                                                        removeMember([member])
                                                    }
                                                    className="text-destructive focus:text-destructive"
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
                            <TableCell colSpan={COLUMN_COUNT} className="p-0">
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
