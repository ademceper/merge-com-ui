import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@merge/ui/components/dialog";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import useLocaleSort, { mapByKey } from "../../utils/useLocaleSort";

type AddProviderDialogProps = {
    onConfirm: (providerId: string) => void;
    toggleDialog: () => void;
};

export const AddProviderDialog = ({
    onConfirm,
    toggleDialog
}: AddProviderDialogProps) => {
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
        <Dialog open onOpenChange={(open) => { if (!open) toggleDialog(); }}>
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
                                toggleDialog();
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
