import { useTranslation } from "@merge-rd/i18n";
import { TextControl } from "@/shared/keycloak-ui-shared";

export const KubernetesSettings = () => {
    const { t } = useTranslation();

    return (
        <>
            <TextControl
                name="alias"
                label={t("alias")}
                labelIcon={t("aliasHelp")}
                rules={{
                    required: t("required")
                }}
            />

            <TextControl
                name="config.issuer"
                labelIcon={t("kubernetesIssuerUrlHelp")}
                label={t("kubernetesIssuerUrl")}
            />
        </>
    );
};
