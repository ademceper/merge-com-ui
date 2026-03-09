import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { useFormContext, useWatch } from "react-hook-form";
import { HelpItem } from "@/shared/keycloak-ui-shared";
import { FormattedLink } from "../external-link/formatted-link";
import type { ComponentProps } from "./components";

export const UrlComponent = ({ name, label, helpText }: ComponentProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();
    const { value } = useWatch({
        control,
        name: name!,
        defaultValue: ""
    });

    return (
        <div className="keycloak__identity-providers__url_component space-y-2">
            <Label htmlFor={name!} className="flex items-center gap-1">
                {t(label!)}
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </Label>
            <FormattedLink title={t(helpText!)} href={value} isInline />
        </div>
    );
};
