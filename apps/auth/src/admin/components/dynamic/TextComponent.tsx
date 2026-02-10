import { Label } from "@merge/ui/components/label";
import { Textarea } from "@merge/ui/components/textarea";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import type { ComponentProps } from "./components";

export const TextComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    required,
    isDisabled = false,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const { register } = useFormContext();

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </div>
            <Textarea
                id={name!}
                data-testid={name}
                disabled={isDisabled}
                defaultValue={defaultValue?.toString()}
                {...register(convertToName(name!))}
            />
        </div>
    );
};
