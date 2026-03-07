import { Label } from "@merge-rd/ui/components/label";
import { CheckCircle } from "@phosphor-icons/react";
import { useTranslation } from "@merge-rd/i18n";

export const BuildInLabel = () => {
    const { t } = useTranslation();

    return (
        <Label className="inline-flex items-center gap-1">
            <CheckCircle className="size-4" />
            {t("buildIn")}
        </Label>
    );
};
