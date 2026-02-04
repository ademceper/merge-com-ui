import OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { KeycloakDataTable } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import { differenceBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";

type OrganizationModalProps = {
    isJoin?: boolean;
    existingOrgs: OrganizationRepresentation[];
    onAdd: (orgs: OrganizationRepresentation[]) => Promise<void>;
    onClose: () => void;
};

export const OrganizationModal = ({
    isJoin = true,
    existingOrgs,
    onAdd,
    onClose
}: OrganizationModalProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();

    const [selectedRows, setSelectedRows] = useState<UserRepresentation[]>([]);

    const loader = async (first?: number, max?: number, search?: string) => {
        const params = {
            first,
            search,
            max: max! + existingOrgs.length
        };

        const orgs = await adminClient.organizations.find(params);
        return differenceBy(orgs, existingOrgs, "id");
    };

    return (
        <Dialog open onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isJoin ? t("joinOrganization") : t("sendInvitation")}
                    </DialogTitle>
                </DialogHeader>
                <KeycloakDataTable
                    loader={loader}
                    isPaginated
                    ariaLabelKey="organizationsList"
                    searchPlaceholderKey="searchOrganization"
                    canSelectAll
                    onSelect={rows => setSelectedRows([...rows])}
                    columns={[
                        {
                            name: "name",
                            displayKey: "organizationName"
                        },
                        {
                            name: "description",
                            cellRenderer: row => (
                                <span className="truncate block">
                                    {row.description}
                                </span>
                            )
                        }
                    ]}
                />
                <DialogFooter>
                    <Button
                        data-testid="cancel"
                        variant="ghost"
                        onClick={onClose}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        data-testid="join"
                        onClick={async () => {
                            await onAdd(selectedRows);
                            onClose();
                        }}
                    >
                        {isJoin ? t("join") : t("send")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
