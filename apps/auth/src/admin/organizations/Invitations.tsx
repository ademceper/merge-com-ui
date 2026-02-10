import type { OrganizationInvitationRepresentation } from "@keycloak/keycloak-admin-client";
import { OrganizationInvitationStatus } from "@keycloak/keycloak-admin-client";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { CheckboxFilterComponent } from "../components/dynamic/CheckboxFilterComponent";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useParams } from "../utils/useParams";
import { Checkbox } from "@merge/ui/components/checkbox";
import { DataTable, DataTableRowActions } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import useToggle from "../utils/useToggle";
import { InviteMemberModal } from "./InviteMemberModal";
import { EditOrganizationParams } from "./routes/EditOrganization";
import { SearchInputComponent } from "../components/dynamic/SearchInputComponent";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge/ui/components/alert-dialog";
import useFormatDate from "../utils/useFormatDate";

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

export const Invitations = () => {
    const { t } = useTranslation();
    const { adminClient } = useAdminClient();
    const { id: orgId } = useParams<EditOrganizationParams>();
const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const [openInviteMembers, toggleInviteMembers] = useToggle();
    const [selectedInvitations, setSelectedInvitations] = useState<
        OrganizationInvitationRepresentation[]
    >([]);
    const [searchText, setSearchText] = useState<string>("");
    const [searchTriggerText, setSearchTriggerText] = useState<string>("");
    const [filteredStatuses, setFilteredStatuses] = useState<string[]>([]);
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

    const statusOptions = Object.values(OrganizationInvitationStatus).map(
        (status: string) => ({
            value: status,
            label: t(`organizationInvitationStatus.${status.toLowerCase()}`)
        })
    );

    const [invitations, setInvitations] = useState<OrganizationInvitationRepresentation[]>([]);

    useFetch(
        async () => {
            try {
                return await adminClient.organizations.listInvitations({
                    orgId,
                    first: 0,
                    max: 500,
                    search: searchTriggerText,
                    status: filteredStatuses.length === 1 ? filteredStatuses[0] : undefined
                });
            } catch (error) {
                toast.error(t("organizationsInvitationsListError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                return [];
            }
        },
        setInvitations,
        [key, searchTriggerText, filteredStatuses]
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
        refresh();
    };

    const clearSearch = () => {
        setSearchText("");
        setSearchTriggerText("");
        refresh();
    };

    const resendInvitation = async (invitation: OrganizationInvitationRepresentation) => {
        try {
            await adminClient.organizations.resendInvitation({
                orgId,
                invitationId: invitation.id!
            });
            toast.success(t("organizationInvitationResent"));
            refresh();
        } catch (error) {
            toast.error(t("organizationInvitationResendError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const deleteInvitations = async (
        invitations: OrganizationInvitationRepresentation[]
    ) => {
        try {
            await Promise.all(
                invitations.map(invitation =>
                    adminClient.organizations.deleteInvitation({
                        orgId,
                        invitationId: invitation.id!
                    })
                )
            );
            toast.success(t("organizationInvitationsDeleted", { count: invitations.length }));
            refresh();
        } catch (error) {
            toast.error(t("organizationInvitationsDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const onDeleteConfirm = async () => {
        await deleteInvitations(selectedInvitations);
        setSelectedInvitations([]);
        setDeleteDialogOpen(false);
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
        refresh();
    };

    return (
        <>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("organizationInvitationsDeleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("organizationInvitationsDeleteConfirm")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteConfirm}>
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
                        refresh();
                    }}
                />
            )}
            <DataTable<OrganizationInvitationRepresentation>
                key={key}
                columns={[
                    {
                        id: "select",
                        header: "",
                        size: 40,
                        cell: ({ row }) => (
                            <Checkbox
                                checked={selectedInvitations.some(i => i.id === row.original.id)}
                                onCheckedChange={() => toggleSelect(row.original)}
                            />
                        )
                    },
                    { accessorKey: "email", header: t("email") },
                    { accessorKey: "firstName", header: t("firstName"), cell: ({ row }) => row.original.firstName || "-" },
                    { accessorKey: "lastName", header: t("lastName"), cell: ({ row }) => row.original.lastName || "-" },
                    {
                        accessorKey: "sentDate",
                        header: t("sentDate"),
                        cell: ({ row }) => <DateCell date={row.original.sentDate} />
                    },
                    {
                        accessorKey: "expiresAt",
                        header: t("expiresAt"),
                        cell: ({ row }) => <DateCell date={row.original.expiresAt} />
                    },
                    {
                        accessorKey: "status",
                        header: t("status"),
                        cell: ({ row }) => <InvitationStatusBadge status={row.original.status} />
                    },
                    {
                        id: "actions",
                        header: "",
                        size: 50,
                        enableHiding: false,
                        cell: ({ row }) => {
                            const inv = row.original;
                            return (
                                <DataTableRowActions row={row}>
                                    <button type="button" className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent" onClick={() => resendInvitation(inv)}>
                                        {t("resendInvitation")}
                                    </button>
                                    {inv.inviteLink && (
                                        <button type="button" className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent" onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(inv.inviteLink!);
                                                toast.success(t("inviteLinkCopied"));
                                            } catch (err) {
                                                toast.error(t("clipboardCopyError", { error: getErrorMessage(err) }), { description: getErrorDescription(err) });
                                            }
                                        }}>
                                            {t("copyInviteLink")}
                                        </button>
                                    )}
                                    <button type="button" className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10" onClick={() => { setSelectedInvitations([inv]); setDeleteDialogOpen(true); }}>
                                        {t("deleteInvitation")}
                                    </button>
                                </DataTableRowActions>
                            );
                        }
                    }
                ]}
                data={invitations}
                searchColumnId="email"
                searchPlaceholder={t("searchInvitations")}
                emptyContent={
                    <Empty className="py-12">
                        <EmptyHeader><EmptyTitle>{t("emptyInvitations")}</EmptyTitle></EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>{t("emptyInvitationsInstructions")}</EmptyDescription>
                            <Button variant="secondary" onClick={toggleInviteMembers}>{t("inviteMember")}</Button>
                        </EmptyContent>
                    </Empty>
                }
                emptyMessage={t("emptyInvitations")}
                toolbar={
                    <div className="flex flex-wrap items-center gap-2">
                        <SearchInputComponent value={searchText} onChange={setSearchText} onSearch={handleSearch} onClear={clearSearch} placeholder={t("searchInvitations")} aria-label={t("searchInvitations")} />
                        <Button variant="default" onClick={toggleInviteMembers}>{t("inviteMember")}</Button>
                        <Button variant="ghost" disabled={selectedInvitations.length === 0} onClick={() => setDeleteDialogOpen(true)}>{t("deleteInvitations")}</Button>
                        <CheckboxFilterComponent filterPlaceholderText={t("filterByStatus")} isOpen={isStatusFilterOpen} options={statusOptions} onOpenChange={setIsStatusFilterOpen} onToggleClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)} onSelect={onStatusFilterSelect} selectedItems={filteredStatuses} width="200px" />
                    </div>
                }
            />
        </>
    );
};
