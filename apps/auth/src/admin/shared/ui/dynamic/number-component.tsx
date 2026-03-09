import { useTranslation } from "@merge-rd/i18n";
import { TextControl } from "@/shared/keycloak-ui-shared";
import type { NumberComponentProps } from "./components";

export const NumberComponent = ({
    name,
    label,
    helpText,
    convertToName,
    ...props
}: NumberComponentProps) => {
    const { t } = useTranslation();

    return (
        <TextControl
            name={convertToName(name!)}
            type="number"
            label={t(label!)}
            labelIcon={t(helpText!)}
            data-testid={name}
            {...props}
        />
    );
};
