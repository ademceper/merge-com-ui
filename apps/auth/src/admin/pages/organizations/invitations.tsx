import type { OrganizationInvitationRepresentation } from "@keycloak/keycloak-admin-client";
import { OrganizationInvitationStatus } from "@keycloak/keycloak-admin-client";
import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import type { EditOrganizationParams } from "@/admin/shared/lib/routes/organizations";
import { useFormatDate } from "@/admin/shared/lib/use-format-date";
import { useParams } from "@/admin/shared/lib/use-params";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { CheckboxFilterComponent } from "@/admin/shared/ui/dynamic/checkbox-filter-component";
import { SearchInputComponent } from "@/admin/shared/ui/dynamic/search-input-component";
import { useDeleteInvitations } from "./hooks/use-delete-invitations";
import { useOrganizationInvitations } from "./hooks/use-organization-invitations";
import { useResendInvitation } from "./hooks/use-resend-invitation";
import { InviteMemberModal } from "./invite-member-modal";

const InvitationStatusBadge = ({ status }: { status?: OrganizationInvitationStatus }) => {
    const { t } = useTranslation();

    return (
        <Badge variant="outline">
            {status ? t(`organizationInvitationStatus.${status.toLowerCase()}`) : ""}
        </Badge>
    );
};

const DateCell = ({ date }: { date?: number }) => {
    const formatDate = useFormatDate();

    if (!date) {
        return <span>-</span>;
    }

    try {
        return <span>{formatDate(new Date(date * 1000))}</span>;
    } catch {
        return <span>{date}</span>;
    }
};

const COLUMN_COUNT = 8;

export const Invitations = () => {
    const { t } = useTranslation();
    const { id: orgId } = useParams<EditOrganizationParams>();
    const [openInviteMembers, toggleInviteMembers] = useToggle();
    const [selectedInvitations, setSelectedInvitations] = useState<
        OrganizationInvitationRepresentation[]
    >([]);
    const [searchText, setSearchText] = useState<string>("");
    const [searchTriggerText, setSearchTriggerText] = useState<string>("");
    const [filteredStatuses, setFilteredStatuses] = useState<string[]>([]);
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const statusFilter = filteredStatuses.length === 1 ? filteredStatuses[0] : undefined;
    const { data: invitations = [] } = useOrganizationInvitations(orgId, {
        search: searchTriggerText,
        status: statusFilter
    });
    const resendMutation = useResendInvitation(orgId);
    const deleteMutation = useDeleteInvitations(orgId);

    const statusOptions = Object.values(OrganizationInvitationStatus).map(
        (status: string) => ({
            value: status,
            label: t(`organizationInvitationStatus.${status.toLowerCase()}`)
        })
    );

    const toggleSelect = (inv: OrganizationInvitationRepresentation) => {
        setSelectedInvitations(prev =>
            prev.some(i => i.id === inv.id)
                ? prev.filter(i => i.id !== inv.id)
                : [...prev, inv]
        );
    };

    const handleSearch = () => {
        setSearchTriggerText(searchText);
    };

    const clearSearch = () => {
        setSearchText("");
        setSearchTriggerText("");
    };

    const resendInvitation = async (invitation: OrganizationInvitationRepresentation) => {
        try {
            await resendMutation.mutateAsync(invitation.id!);
            toast.success(t("organizationInvitationResent"));
        } catch (error) {
            toast.error(
                t("organizationInvitationResendError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const onDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync(selectedInvitations.map(i => i.id!));
            toast.success(
                t("organizationInvitationsDeleted", { count: selectedInvitations.length })
            );
            setSelectedInvitations([]);
            setDeleteDialogOpen(false);
        } catch (error) {
            toast.error(
                t("organizationInvitationsDeleteError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const onStatusFilterSelect = (
        _event: React.MouseEvent<HTMLButtonElement>,
        value: string
    ) => {
        if (filteredStatuses.includes(value)) {
            setFilteredStatuses(filteredStatuses.filter(status => status !== value));
        } else {
            setFilteredStatuses([...filteredStatuses, value]);
        }
        setIsStatusFilterOpen(false);
    };

    const filteredInvitations = useMemo(() => {
        if (!search) return invitations;
        const lower = search.toLowerCase();
        return invitations.filter(inv => inv.email?.toLowerCase().includes(lower));
    }, [invitations, search]);

    const totalCount = filteredInvitations.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedInvitations = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredInvitations.slice(start, start + pageSize);
    }, [filteredInvitations, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    return (
        <>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("organizationInvitationsDeleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("organizationInvitationsDeleteConfirm")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {openInviteMembers && (
                <InviteMemberModal
                    orgId={orgId}
                    onClose={() => {
                        toggleInviteMembers();
                    }}
                />
            )}
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <SearchInputComponent
                            value={searchText}
                            onChange={setSearchText}
                            onSearch={handleSearch}
                            onClear={clearSearch}
                            placeholder={t("searchInvitations")}
                            aria-label={t("searchInvitations")}
                        />
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("searchInvitations")}
                        />
                        <CheckboxFilterComponent
                            filterPlaceholderText={t("filterByStatus")}
                            isOpen={isStatusFilterOpen}
                            options={statusOptions}
                            onOpenChange={setIsStatusFilterOpen}
                            onToggleClick={() =>
                                setIsStatusFilterOpen(!isStatusFilterOpen)
                            }
                            onSelect={onStatusFilterSelect}
                            selectedItems={filteredStatuses}
                            width="200px"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="default" onClick={toggleInviteMembers}>
                            {t("inviteMember")}
                        </Button>
                        <Button
                            variant="ghost"
                            disabled={selectedInvitations.length === 0}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            {t("deleteInvitations")}
                        </Button>
                    </div>
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10" />
                            <TableHead className="w-[20%]">{t("email")}</TableHead>
                            <TableHead className="w-[12%]">{t("firstName")}</TableHead>
                            <TableHead className="w-[12%]">{t("lastName")}</TableHead>
                            <TableHead className="w-[15%]">{t("sentDate")}</TableHead>
                            <TableHead className="w-[15%]">{t("expiresAt")}</TableHead>
                            <TableHead className="w-[12%]">{t("status")}</TableHead>
                            <TableHead className="w-12.5" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedInvitations.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={COLUMN_COUNT}
                                    className="text-center text-muted-foreground"
                                >
                                    {invitations.length === 0 ? (
                                        <Empty className="py-12">
                                            <EmptyHeader>
                                                <EmptyTitle>
                                                    {t("emptyInvitations")}
                                                </EmptyTitle>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <EmptyDescription>
                                                    {t("emptyInvitationsInstructions")}
                                                </EmptyDescription>
                                                <Button
                                                    variant="secondary"
                                                    onClick={toggleInviteMembers}
                                                >
                                                    {t("inviteMember")}
                                                </Button>
                                            </EmptyContent>
                                        </Empty>
                                    ) : (
                                        t("emptyInvitations")
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedInvitations.map(inv => (
                                <TableRow key={inv.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedInvitations.some(
                                                i => i.id === inv.id
                                            )}
                                            onCheckedChange={() => toggleSelect(inv)}
                                        />
                                    </TableCell>
                                    <TableCell className="truncate">{inv.email}</TableCell>
                                    <TableCell className="truncate">
                                        {inv.firstName || "-"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {inv.lastName || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <DateCell date={inv.sentDate} />
                                    </TableCell>
                                    <TableCell>
                                        <DateCell date={inv.expiresAt} />
                                    </TableCell>
                                    <TableCell>
                                        <InvitationStatusBadge status={inv.status} />
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
                                                    onClick={() => resendInvitation(inv)}
                                                >
                                                    {t("resendInvitation")}
                                                </DropdownMenuItem>
                                                {inv.inviteLink && (
                                                    <DropdownMenuItem
                                                        onClick={async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(
                                                                    inv.inviteLink!
                                                                );
                                                                toast.success(
                                                                    t("inviteLinkCopied")
                                                                );
                                                            } catch (err) {
                                                                toast.error(
                                                                    t("clipboardCopyError", {
                                                                        error: getErrorMessage(
                                                                            err
                                                                        )
                                                                    }),
                                                                    {
                                                                        description:
                                                                            getErrorDescription(
                                                                                err
                                                                            )
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {t("copyInviteLink")}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        setSelectedInvitations([inv]);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    {t("deleteInvitation")}
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
