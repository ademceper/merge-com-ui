import { useTranslation } from "@merge-rd/i18n";
import { useFormContext, useWatch } from "react-hook-form";
import { TextControl } from "../../../../shared/keycloak-ui-shared";
import { useParams } from "../../../shared/lib/useParams";
import { DisplayOrder } from "../component/display-order";
import { RedirectUrl } from "../component/redirect-url";
import type { IdentityProviderParams } from "../../../shared/lib/routes/identity-providers";

export const OIDCGeneralSettings = () => {
    const { t } = useTranslation();
    const { tab } = useParams<IdentityProviderParams>();

    const { control } = useFormContext();
    const alias = useWatch({ control, name: "alias" });

    return (
        <>
            <RedirectUrl id={alias} />

            <TextControl
                name="alias"
                label={t("alias")}
                labelIcon={t("aliasHelp")}
                readOnly={tab === "settings"}
                rules={{
                    required: t("required")
                }}
            />

            <TextControl name="displayName" label={t("displayName")} />
            <DisplayOrder />
        </>
    );
};
