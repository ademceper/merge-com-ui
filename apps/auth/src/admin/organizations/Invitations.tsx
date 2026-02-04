import type { OrganizationInvitationRepresentation } from "@keycloak/keycloak-admin-client";
import { OrganizationInvitationStatus } from "@keycloak/keycloak-admin-client";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { CheckboxFilterComponent } from "../components/dynamic/CheckboxFilterComponent";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { ListEmptyState } from "../../shared/keycloak-ui-shared";
import { KeycloakDataTable } from "../../shared/keycloak-ui-shared";
import { useParams } from "../utils/useParams";
import useToggle from "../utils/useToggle";
import { InviteMemberModal } from "./InviteMemberModal";
import { EditOrganizationParams } from "./routes/EditOrganization";
import { SearchInputComponent } from "../components/dynamic/SearchInputComponent";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
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

    const loader = async (first?: number, max?: number) => {
        try {
            const invitations: OrganizationInvitationRepresentation[] =
                await adminClient.organizations.listInvitations({
                    orgId,
                    first,
                    max,
                    search: searchTriggerText,
                    status:
                        filteredStatuses.length === 1 ? filteredStatuses[0] : undefined
                });

            return invitations;
        } catch (error) {
            toast.error(t("organizationsInvitationsListError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            return [];
        }
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

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "organizationInvitationsDeleteConfirmTitle",
        messageKey: "organizationInvitationsDeleteConfirm",
        continueButtonLabel: "delete",
        onConfirm: () => deleteInvitations(selectedInvitations)
    });

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
            <DeleteConfirm />
            {openInviteMembers && (
                <InviteMemberModal
                    orgId={orgId}
                    onClose={() => {
                        toggleInviteMembers();
                        refresh();
                    }}
                />
            )}
            <KeycloakDataTable
                key={key}
                loader={loader}
                isPaginated
                ariaLabelKey="invitationsList"
                onSelect={setSelectedInvitations}
                canSelectAll
                toolbarItem={
                    <>
                        <div>
                            <SearchInputComponent
                                value={searchText}
                                onChange={setSearchText}
                                onSearch={handleSearch}
                                onClear={clearSearch}
                                placeholder={t("searchInvitations")}
                                aria-label={t("searchInvitations")}
                            />
                        </div>
                        <div>
                            <Button variant="default" onClick={toggleInviteMembers}>
                                {t("inviteMember")}
                            </Button>
                        </div>
                        <div>
                            <Button
                                variant="ghost"
                                disabled={selectedInvitations.length === 0}
                                onClick={toggleDeleteDialog}
                            >
                                {t("deleteInvitations")}
                            </Button>
                        </div>
                        <div>
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
                    </>
                }
                actionResolver={rowData => {
                    const invitation = rowData.data as OrganizationInvitationRepresentation;
                    const actions = [
                        {
                            title: t("resendInvitation"),
                            onClick: () => resendInvitation(invitation)
                        },
                        {
                            title: t("deleteInvitation"),
                            onClick: () => {
                                setSelectedInvitations([invitation]);
                                toggleDeleteDialog();
                            }
                        }
                    ];

                    if (invitation.inviteLink) {
                        actions.splice(1, 0, {
                            title: t("copyInviteLink"),
                            onClick: async () => {
                                try {
                                    await navigator.clipboard.writeText(
                                        invitation.inviteLink!
                                    );
                                    toast.success(t("inviteLinkCopied"));
                                } catch (error) {
                                    toast.error(t("clipboardCopyError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                                }
                            }
                        });
                    }

                    return actions;
                }}
                columns={[
                    {
                        name: "email",
                        displayKey: "email"
                    },
                    {
                        name: "firstName",
                        displayKey: "firstName",
                        cellRenderer: invitation => invitation.firstName || "-"
                    },
                    {
                        name: "lastName",
                        displayKey: "lastName",
                        cellRenderer: invitation => invitation.lastName || "-"
                    },
                    {
                        name: "sentDate",
                        displayKey: "sentDate",
                        cellRenderer: invitation => (
                            <DateCell date={invitation.sentDate} />
                        )
                    },
                    {
                        name: "expiresAt",
                        displayKey: "expiresAt",
                        cellRenderer: invitation => (
                            <DateCell date={invitation.expiresAt} />
                        )
                    },
                    {
                        name: "status",
                        displayKey: "status",
                        cellRenderer: invitation => (
                            <InvitationStatusBadge status={invitation.status} />
                        )
                    }
                ]}
                emptyState={
                    <ListEmptyState
                        message={t("emptyInvitations")}
                        instructions={t("emptyInvitationsInstructions")}
                        secondaryActions={[
                            {
                                text: t("inviteMember"),
                                onClick: toggleInviteMembers
                            }
                        ]}
                    />
                }
                isSearching={searchTriggerText.length > 0 || filteredStatuses.length > 0}
            />
        </>
    );
};
