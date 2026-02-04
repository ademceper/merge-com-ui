import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";

import { EventsTypeTable, EventType } from "./EventsTypeTable";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";

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
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("addTypes")}</DialogTitle>
                </DialogHeader>
                <EventsTypeTable
                    ariaLabelKey="addTypes"
                    onSelect={selected => setSelectedTypes(selected)}
                    eventTypes={enums!["eventType"].filter(
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
                    <Button
                        data-testid="moveCancel"
                        variant="ghost"
                        onClick={onClose}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
