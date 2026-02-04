import type ClientProfileRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { KeycloakDataTable, useFetch } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { ListEmptyState } from "../../shared/keycloak-ui-shared";
import { translationFormatter } from "../utils/translationFormatter";

type ClientProfile = ClientProfileRepresentation & {
    global: boolean;
};

const AliasRenderer = ({ name, global }: ClientProfile) => {
    const { t } = useTranslation();

    return (
        <>
            {name} {global && <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300 ml-1">{t("global")}</Badge>}
        </>
    );
};

export type AddClientProfileModalProps = {
    open: boolean;
    toggleDialog: () => void;
    onConfirm: (newReps: RoleRepresentation[]) => void;
    allProfiles: string[];
};

export const AddClientProfileModal = (props: AddClientProfileModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<RoleRepresentation[]>([]);

    const [tableProfiles, setTableProfiles] = useState<ClientProfile[]>();

    useFetch(
        () =>
            adminClient.clientPolicies.listProfiles({
                includeGlobalProfiles: true
            }),
        allProfiles => {
            const globalProfiles = allProfiles.globalProfiles?.map(globalProfiles => ({
                id: globalProfiles.name,
                ...globalProfiles,
                global: true
            }));

            const profiles = allProfiles.profiles?.map(profiles => ({
                ...profiles,
                global: false
            }));

            setTableProfiles([...(globalProfiles ?? []), ...(profiles ?? [])]);
        },
        []
    );

    const loader = async () =>
        tableProfiles?.filter(item => !props.allProfiles.includes(item.name!)) ?? [];

    if (!tableProfiles) {
        return <KeycloakSpinner />;
    }

    return (
        <Dialog open={props.open} onOpenChange={(open) => { if (!open) props.toggleDialog(); }}>
            <DialogContent data-testid="addClientProfile" className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{t("addClientProfile")}</DialogTitle>
                </DialogHeader>
                <KeycloakDataTable
                    loader={loader}
                    ariaLabelKey="profilesList"
                    searchPlaceholderKey="searchProfile"
                    canSelectAll
                    onSelect={rows => {
                        setSelectedRows([...rows]);
                    }}
                    columns={[
                        {
                            name: "name",
                            displayKey: "clientProfileName",
                            cellRenderer: AliasRenderer
                        },
                        {
                            name: "description",
                            cellFormatters: [translationFormatter(t)]
                        }
                    ]}
                    emptyState={
                        <ListEmptyState
                            hasIcon
                            message={t("noRoles")}
                            instructions={t("noRolesInstructions")}
                            primaryActionText={t("createRole")}
                        />
                    }
                />
                <DialogFooter>
                    <Button
                        data-testid="add-client-profile-button"
                        disabled={!selectedRows.length}
                        onClick={() => {
                            props.toggleDialog();
                            props.onConfirm(selectedRows);
                        }}
                    >
                        {t("add")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            props.toggleDialog();
                        }}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
