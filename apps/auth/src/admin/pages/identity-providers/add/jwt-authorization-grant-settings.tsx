import { useTranslation } from "@merge-rd/i18n";
import { TextControl, NumberControl } from "../../../../shared/keycloak-ui-shared";
import { JWTAuthorizationGrantAssertionSettings } from "./jwt-authorization-grant-assertion-settings";
import { Separator } from "@merge-rd/ui/components/separator";
import { JwksSettings } from "./jwks-settings";
import { useParams } from "../../../shared/lib/useParams";
import type { IdentityProviderParams } from "../routes/identity-provider";

export default function JWTAuthorizationGrantSettings() {
    const { t } = useTranslation();
    const { tab } = useParams<IdentityProviderParams>();

    return (
        <>
            <TextControl
                name="alias"
                label={t("alias")}
                labelIcon={t("aliasHelp")}
                readOnly={tab === "settings"}
                rules={{
                    required: t("required")
                }}
            />
            <TextControl
                name="config.issuer"
                label={t("issuer")}
                rules={{
                    required: t("required")
                }}
            />
            <JwksSettings />
            <JWTAuthorizationGrantAssertionSettings />
            <NumberControl
                name="config.jwtAuthorizationGrantAllowedClockSkew"
                label={t("allowedClockSkew")}
                labelIcon={t("allowedClockSkewHelp")}
                controller={{ defaultValue: 0, rules: { min: 0, max: 2147483 } }}
            />
            <Separator />
        </>
    );
}
