import type UserConsentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userConsentRepresentation";
import { Badge } from "@merge/ui/components/badge";
import { Cube } from "@phosphor-icons/react";
import { cellWidth } from "../../shared/keycloak-ui-shared";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ListEmptyState } from "../../shared/keycloak-ui-shared";
import { Action, KeycloakDataTable } from "../../shared/keycloak-ui-shared";
import { emptyFormatter } from "../util";
import useFormatDate from "../utils/useFormatDate";
import { useParams } from "../utils/useParams";

export const UserConsents = () => {
    const { adminClient } = useAdminClient();

    const [selectedClient, setSelectedClient] = useState<UserConsentRepresentation>();
    const { t } = useTranslation();
const formatDate = useFormatDate();
    const [key, setKey] = useState(0);

    const { id } = useParams<{ id: string }>();
    const alphabetize = (consentsList: UserConsentRepresentation[]) => {
        return sortBy(consentsList, client => client.clientId?.toUpperCase());
    };

    const refresh = () => setKey(new Date().getTime());

    const loader = async () => {
        const getConsents = await adminClient.users.listConsents({ id });

        return alphabetize(getConsents);
    };

    const clientScopesRenderer = ({ grantedClientScopes }: UserConsentRepresentation) => {
        return (
            <div className="flex gap-1 flex-wrap kc-consents-chip-group">
                {grantedClientScopes!.map(currentChip => (
                    <Badge key={currentChip} variant="secondary" className="kc-consents-chip">
                        {currentChip}
                    </Badge>
                ))}
            </div>
        );
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "revokeClientScopesTitle",
        messageKey: t("revokeClientScopes", {
            clientId: selectedClient?.clientId
        }),
        continueButtonLabel: "revoke",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.users.revokeConsent({
                    id,
                    clientId: selectedClient!.clientId!
                });

                refresh();

                toast.success(t("deleteGrantsSuccess"));
            } catch (error) {
                toast.error(t("deleteGrantsError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    return (
        <>
            <DeleteConfirm />
            <KeycloakDataTable
                loader={loader}
                key={key}
                ariaLabelKey="roleList"
                searchPlaceholderKey=" "
                columns={[
                    {
                        name: "clientId",
                        displayKey: "Client",
                        cellFormatters: [emptyFormatter()],
                        transforms: [cellWidth(20)]
                    },
                    {
                        name: "grantedClientScopes",
                        displayKey: "grantedClientScopes",
                        cellRenderer: clientScopesRenderer,
                        transforms: [cellWidth(30)]
                    },
                    {
                        name: "createdDate",
                        displayKey: "created",
                        transforms: [cellWidth(20)],
                        cellRenderer: ({ createdDate }) =>
                            createdDate ? formatDate(new Date(createdDate)) : "—"
                    },
                    {
                        name: "lastUpdatedDate",
                        displayKey: "lastUpdated",
                        transforms: [cellWidth(10)],
                        cellRenderer: ({ lastUpdatedDate }) =>
                            lastUpdatedDate ? formatDate(new Date(lastUpdatedDate)) : "—"
                    }
                ]}
                actions={[
                    {
                        title: t("revoke"),
                        onRowClick: client => {
                            setSelectedClient(client);
                            toggleDeleteDialog();
                        }
                    } as Action<UserConsentRepresentation>
                ]}
                emptyState={
                    <ListEmptyState
                        hasIcon={true}
                        icon={Cube}
                        message={t("noConsents")}
                        instructions={t("noConsentsText")}
                    />
                }
            />
        </>
    );
};
