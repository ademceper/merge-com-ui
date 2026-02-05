import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@merge/ui/components/dialog";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import useLocaleSort, { mapByKey } from "../../utils/useLocaleSort";

type AddProviderDialogProps = {
    onConfirm: (providerId: string) => void;
    toggleDialog: () => void;
    /** When provided, dialog visibility is controlled by parent (e.g. open={isAddDialogOpen}). */
    open?: boolean;
    /** When provided, called when dialog open state changes (e.g. onOpenChange={(open) => !open && toggleAddDialog()}). */
    onOpenChange?: (open: boolean) => void;
};

export const AddProviderDialog = ({
    onConfirm,
    toggleDialog,
    open: controlledOpen,
    onOpenChange
}: AddProviderDialogProps) => {
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : true;
    const handleOpenChange = (next: boolean) => {
        if (next) return;
        if (onOpenChange) onOpenChange(false);
        else toggleDialog();
    };

    const closeDialog = () => {
        if (onOpenChange) onOpenChange(false);
        else toggleDialog();
    };
    const { t } = useTranslation();
    const serverInfo = useServerInfo();
    const providers = Object.keys(
        serverInfo.providers?.["client-registration-policy"].providers || []
    );

    const descriptions =
        serverInfo.componentTypes?.[
            "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy"
        ];
    const localeSort = useLocaleSort();

    const rows = useMemo(
        () =>
            localeSort(
                descriptions?.filter(d => providers.includes(d.id)) || [],
                mapByKey("id")
            ),
        [providers, descriptions]
    );
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("chooseAPolicyProvider")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-1" aria-label={t("addPredefinedMappers")}>
                    <div className="grid grid-cols-[1fr_2fr] gap-2 p-2 font-bold text-sm">
                        <span>{t("name")}</span>
                        <span>{t("description")}</span>
                    </div>
                    {rows.map(provider => (
                        <div
                            key={provider.id}
                            data-testid={provider.id}
                            className="grid grid-cols-[1fr_2fr] gap-2 p-2 hover:bg-muted cursor-pointer rounded text-sm"
                            onClick={() => {
                                onConfirm(provider.id);
                                closeDialog();
                            }}
                        >
                            <span>{provider.id}</span>
                            <span>{provider.helpText}</span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
