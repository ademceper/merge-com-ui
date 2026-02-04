import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { Label } from "@merge/ui/components/label";
import { Info } from "@phosphor-icons/react";
import { differenceBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { ListEmptyState } from "../../shared/keycloak-ui-shared";
import { KeycloakDataTable } from "../../shared/keycloak-ui-shared";
import { emptyFormatter } from "../util";

type MemberModalProps = {
    membersQuery: (first?: number, max?: number) => Promise<UserRepresentation[]>;
    onAdd: (users: UserRepresentation[]) => Promise<void>;
    onClose: () => void;
};

const UserDetail = (user: UserRepresentation) => {
    const { t } = useTranslation();
    return (
        <>
            {user.username}{" "}
            {!user.enabled && (
                <Label className="text-red-500"><Info className="size-4 inline mr-1" />
                    {t("disabled")}
                </Label>
            )}
        </>
    );
};

export const MemberModal = ({ membersQuery, onAdd, onClose }: MemberModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<UserRepresentation[]>([]);

    const loader = async (first?: number, max?: number, search?: string) => {
        const members = await membersQuery(first, max);
        const params: { [name: string]: string | number } = {
            first: first!,
            max: max! + members.length,
            search: search || ""
        };

        try {
            const users = await adminClient.users.find({ ...params });
            return differenceBy(users, members, "id").slice(0, max);
        } catch (error) {
            toast.error(t("noUsersFoundError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            return [];
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{t("addMember")}</DialogTitle>
                </DialogHeader>
                <KeycloakDataTable
                    loader={loader}
                    isPaginated
                    ariaLabelKey="titleUsers"
                    searchPlaceholderKey="searchForUser"
                    canSelectAll
                    onSelect={rows => setSelectedRows([...rows])}
                    emptyState={
                        <ListEmptyState
                            message={t("noUsersFound")}
                            instructions={t("emptyInstructions")}
                        />
                    }
                    columns={[
                        {
                            name: "username",
                            displayKey: "username",
                            cellRenderer: UserDetail
                        },
                        {
                            name: "email",
                            displayKey: "email",
                            cellFormatters: [emptyFormatter()]
                        },
                        {
                            name: "lastName",
                            displayKey: "lastName",
                            cellFormatters: [emptyFormatter()]
                        },
                        {
                            name: "firstName",
                            displayKey: "firstName",
                            cellFormatters: [emptyFormatter()]
                        }
                    ]}
                />
                <DialogFooter>
                    <Button
                        data-testid="add"
                        variant="default"
                        onClick={async () => {
                            await onAdd(selectedRows);
                            onClose();
                        }}
                    >
                        {t("add")}
                    </Button>
                    <Button
                        data-testid="cancel"
                        variant="link"
                        onClick={onClose}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
