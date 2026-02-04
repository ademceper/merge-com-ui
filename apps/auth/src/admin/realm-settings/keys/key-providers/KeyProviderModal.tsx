import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import { useTranslation } from "react-i18next";
import { KeyProviderForm } from "./KeyProviderForm";
import type { ProviderType } from "../../routes/KeyProvider";

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
