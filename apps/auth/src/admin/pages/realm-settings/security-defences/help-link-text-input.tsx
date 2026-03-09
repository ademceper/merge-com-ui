import { Trans, useTranslation } from "@merge-rd/i18n";
import { TextControl } from "@/shared/keycloak-ui-shared";
import { FormattedLink } from "@/admin/shared/ui/external-link/formatted-link";

type HelpLinkTextInputProps = {
    fieldName: string;
    url: string;
};

export const HelpLinkTextInput = ({ fieldName, url }: HelpLinkTextInputProps) => {
    const { t } = useTranslation();
    const name = fieldName.substring(fieldName.indexOf(".") + 1);
    return (
        <TextControl
            name={fieldName}
            label={t(name)}
            labelIcon={
                <Trans
                    i18nKey={`${name}Help`}
                    components={{
                        formattedlink: <FormattedLink href={url} title={t("learnMore")} />
                    }}
                />
            }
        />
    );
};
