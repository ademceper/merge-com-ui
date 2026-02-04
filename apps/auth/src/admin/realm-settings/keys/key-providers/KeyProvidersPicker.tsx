import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { useTranslation } from "react-i18next";
import { useServerInfo } from "../../../context/server-info/ServerInfoProvider";
import { KEY_PROVIDER_TYPE } from "../../../util";

type KeyProvidersPickerProps = {
    onConfirm: (provider: string) => void;
    onClose: () => void;
};

export const KeyProvidersPicker = ({ onConfirm, onClose }: KeyProvidersPickerProps) => {
    const { t } = useTranslation();
    const serverInfo = useServerInfo();
    const keyProviderComponentTypes =
        serverInfo.componentTypes?.[KEY_PROVIDER_TYPE] ?? [];
    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("addProvider")}</DialogTitle>
                </DialogHeader>
                <ul className="divide-y border rounded-md" aria-label={t("addPredefinedMappers")}>
                    {keyProviderComponentTypes.map(provider => (
                        <li
                            key={provider.id}
                            className="flex items-center gap-4 py-3 px-4 cursor-pointer hover:bg-muted/50"
                            data-testid={`option-${provider.id}`}
                            onClick={() => onConfirm(provider.id)}
                        >
                            <span className="font-medium">{provider.id}</span>
                            <span className="text-sm text-muted-foreground flex-1">{provider.helpText}</span>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
};
