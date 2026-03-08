import { useTranslation } from "@merge-rd/i18n";
import { TextControl } from "../../../../shared/keycloak-ui-shared";

export const SpiffeSettings = () => {
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
                name="config.trustDomain"
                label={t("spiffeTrustDomain")}
                labelIcon={t("spiffeTrustDomainHelp")}
                rules={{
                    required: t("required")
                }}
            />

            <TextControl
                name="config.bundleEndpoint"
                label={t("spiffeBundleEndpoint")}
                labelIcon={t("Specify a URL starting with 'https://'.")}
                rules={{
                    required: t("required")
                }}
            />
        </>
    );
};
