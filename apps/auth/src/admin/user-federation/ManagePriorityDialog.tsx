import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";

type ManagePriorityDialogProps = {
    components: ComponentRepresentation[];
    onClose: () => void;
};

export const ManagePriorityDialog = ({
    components,
    onClose
}: ManagePriorityDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const [liveText, setLiveText] = useState("");
    const [order, setOrder] = useState(
        sortBy(components, "config.priority", "name").map(component => component.name!)
    );
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const onDragStartHandler = (index: number) => {
        setDragIndex(index);
        setLiveText(t("onDragStart", { item: order[index] }));
    };

    const onDragOverHandler = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        const result = [...order];
        const [removed] = result.splice(dragIndex, 1);
        result.splice(index, 0, removed);
        setOrder(result);
        setDragIndex(index);
        setLiveText(t("onDragMove", { item: order[index] }));
    };

    const onDragEndHandler = () => {
        setDragIndex(null);
        setLiveText(t("onDragFinish", { list: order }));
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("managePriorityOrder")}</DialogTitle>
                </DialogHeader>

                <p className="pb-4">{t("managePriorityInfo")}</p>

                <div
                    aria-label={t("manageOrderTableAria")}
                    data-testid="manageOrderDataList"
                    className="space-y-1"
                >
                    {order.map((name, index) => (
                        <div
                            key={name}
                            draggable
                            onDragStart={() => onDragStartHandler(index)}
                            onDragOver={(e) => onDragOverHandler(e, index)}
                            onDragEnd={onDragEndHandler}
                            className="flex items-center gap-2 p-2 border rounded cursor-grab"
                            aria-label={name}
                            id={name}
                        >
                            <span className="text-muted-foreground cursor-grab" aria-label={t("dragHelp")}>☰</span>
                            <span data-testid={name}>{name}</span>
                        </div>
                    ))}
                </div>
                <div className="sr-only" aria-live="assertive">
                    {liveText}
                </div>

                <DialogFooter>
                    <Button
                        id="modal-confirm"
                        onClick={async () => {
                            const updates = order.map((name, index) => {
                                const component = components!.find(c => c.name === name)!;
                                component.config!.priority = [index.toString()];
                                return adminClient.components.update(
                                    { id: component.id! },
                                    component
                                );
                            });

                            try {
                                await Promise.all(updates);
                                toast.success(t("orderChangeSuccessUserFed"));
                            } catch (error) {
                                toast.error(t("orderChangeErrorUserFed", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                            }

                            onClose();
                        }}
                    >
                        {t("save")}
                    </Button>
                    <Button
                        id="modal-cancel"
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
