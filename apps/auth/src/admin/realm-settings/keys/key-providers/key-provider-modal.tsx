import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@merge-rd/ui/components/dialog";
import { useTranslation } from "react-i18next";
import { KeyProviderForm } from "./key-provider-form";
import type { ProviderType } from "../../routes/key-provider";

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
