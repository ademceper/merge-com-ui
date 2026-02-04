import { Label } from "@merge/ui/components/label";
import { useTranslation } from "react-i18next";

import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useFormContext, useWatch } from "react-hook-form";
import type { ComponentProps } from "./components";
import { FormattedLink } from "../external-link/FormattedLink";

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
