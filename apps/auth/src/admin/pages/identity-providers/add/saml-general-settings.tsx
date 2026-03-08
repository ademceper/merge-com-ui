import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { useFormContext, useWatch } from "react-hook-form";
import {
    HelpItem,
    TextControl,
    useEnvironment
} from "../../../../shared/keycloak-ui-shared";
import type { Environment } from "../../../app/environment";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { FormattedLink } from "../../../shared/ui/external-link/formatted-link";
import { DisplayOrder } from "../component/display-order";
import { RedirectUrl } from "../component/redirect-url";

type SamlGeneralSettingsProps = {
    isAliasReadonly?: boolean;
};

export const SamlGeneralSettings = ({
    isAliasReadonly = false
}: SamlGeneralSettingsProps) => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { environment } = useEnvironment<Environment>();

    const { control } = useFormContext();
    const alias = useWatch({ control, name: "alias" });

    return (
        <>
            <RedirectUrl id={alias} />

            <TextControl
                name="alias"
                label={t("alias")}
                labelIcon={t("aliasHelp")}
                readOnly={isAliasReadonly}
                rules={{
                    required: t("required")
                }}
            />

            <TextControl name="displayName" label={t("displayName")} />
            <DisplayOrder />
            {isAliasReadonly && (
                <div className="keycloak__identity-providers__saml_link space-y-2">
                    <Label htmlFor="endpoints" className="flex items-center gap-1">
                        {t("endpoints")}
                        <HelpItem helpText={t("aliasHelp")} fieldLabelId="alias" />
                    </Label>
                    <FormattedLink
                        title={t("samlEndpointsLabel")}
                        href={`${environment.adminBaseUrl}/realms/${realm}/broker/${alias}/endpoint/descriptor`}
                        isInline
                    />
                </div>
            )}
        </>
    );
};
