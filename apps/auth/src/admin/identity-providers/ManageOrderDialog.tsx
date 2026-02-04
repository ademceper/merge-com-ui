import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakSpinner, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { DotsSixVertical } from "@phosphor-icons/react";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";

type ManageOrderDialogProps = {
    orgId?: string;
    hideRealmBasedIdps?: boolean;
    onClose: () => void;
};

export const ManageOrderDialog = ({
    orgId,
    hideRealmBasedIdps = false,
    onClose
}: ManageOrderDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const [liveText, setLiveText] = useState("");
    const [providers, setProviders] = useState<IdentityProviderRepresentation[]>();
    const [order, setOrder] = useState<string[]>([]);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    useFetch(
        () =>
            orgId
                ? adminClient.organizations.listIdentityProviders({ orgId })
                : adminClient.identityProviders.find({ realmOnly: hideRealmBasedIdps }),
        providers => {
            setProviders(providers);
            setOrder(
                sortBy(providers, ["config.guiOrder", "alias"]).map(
                    provider => provider.alias!
                )
            );
        },
        []
    );

    if (!providers) {
        return <KeycloakSpinner />;
    }

    const onDragStart = (e: React.DragEvent, index: number) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
        setLiveText(t("onDragStart", { item: order[index] }));
    };

    const onDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        const result = [...order];
        const [removed] = result.splice(dragIndex, 1);
        result.splice(index, 0, removed);
        setOrder(result);
        setDragIndex(index);
        setLiveText(t("onDragMove", { item: order[dragIndex] }));
    };

    const onDragEnd = () => {
        setDragIndex(null);
        setLiveText(t("onDragFinish", { list: order }));
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("manageDisplayOrder")}</DialogTitle>
                </DialogHeader>
                <p className="pb-4">
                    {t("orderDialogIntro")}
                </p>

                <div
                    aria-label={t("manageOrderTableAria")}
                    data-testid="manageOrderDataList"
                    className="space-y-1"
                >
                    {order.map((alias, index) => (
                        <div
                            key={alias}
                            draggable
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragOver={(e) => onDragOver(e, index)}
                            onDragEnd={onDragEnd}
                            aria-label={alias}
                            id={alias}
                            className="flex items-center gap-2 p-2 border rounded cursor-grab active:cursor-grabbing"
                        >
                            <DotsSixVertical className="size-4" aria-label={t("dragHelp")} />
                            <span data-testid={alias}>{alias}</span>
                        </div>
                    ))}
                </div>
                <div className="sr-only" aria-live="assertive">
                    {liveText}
                </div>
                <DialogFooter>
                    <Button
                        id="modal-confirm"
                        data-testid="confirm"
                        onClick={async () => {
                            const updates = order.map((alias, index) => {
                                const provider = providers.find(p => p.alias === alias)!;
                                provider.config!.guiOrder = index;
                                return adminClient.identityProviders.update(
                                    { alias },
                                    provider
                                );
                            });

                            try {
                                await Promise.all(updates);
                                toast.success(t("orderChangeSuccess"));
                            } catch (error) {
                                toast.error(t("orderChangeError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                            }

                            onClose();
                        }}
                    >
                        {t("save")}
                    </Button>
                    <Button
                        id="modal-cancel"
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
