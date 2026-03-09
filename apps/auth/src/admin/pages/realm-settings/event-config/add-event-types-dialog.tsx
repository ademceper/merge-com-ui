import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { useState } from "react";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { EventsTypeTable, type EventType } from "./events-type-table";

type AddEventTypesDialogProps = {
    onConfirm: (selected: EventType[]) => void;
    onClose: () => void;
    configured: string[];
};

export const AddEventTypesDialog = ({
    onConfirm,
    onClose,
    configured
}: AddEventTypesDialogProps) => {
    const { t } = useTranslation();
    const { enums } = useServerInfo();

    const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
    return (
        <Dialog
            open
            onOpenChange={open => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("addTypes")}</DialogTitle>
                </DialogHeader>
                <EventsTypeTable
                    ariaLabelKey="addTypes"
                    onSelect={selected => setSelectedTypes(selected)}
                    eventTypes={enums!.eventType.filter(
                        type => !configured.includes(type)
                    )}
                />
                <DialogFooter>
                    <Button
                        data-testid="addEventTypeConfirm"
                        onClick={() => onConfirm(selectedTypes)}
                    >
                        {t("add")}
                    </Button>
                    <Button data-testid="moveCancel" variant="ghost" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
