import { useTranslation } from "@merge-rd/i18n";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import type { ProviderType } from "../../../../shared/lib/routes/realm-settings";
import { KeyProviderForm } from "./key-provider-form";

type KeyProviderModalProps = {
    providerType: ProviderType;
    onClose: () => void;
};

export const KeyProviderModal = ({ providerType, onClose }: KeyProviderModalProps) => {
    const { t } = useTranslation();
    return (
        <Dialog open onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("addProvider")}</DialogTitle>
                </DialogHeader>
                <KeyProviderForm providerType={providerType} onClose={onClose} />
            </DialogContent>
        </Dialog>
    );
};
