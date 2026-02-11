import { useTranslation } from "react-i18next";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { Label } from "@merge/ui/components/label";
import { useFormContext, Controller } from "react-hook-form";
import { TimeSelector } from "../../components/time-selector/TimeSelector";
import { SelectField, HelpItem } from "../../../shared/keycloak-ui-shared";
import { sortProviders } from "../../util";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";

export const JWTAuthorizationGrantAssertionSettings = () => {
    const { t } = useTranslation();
    const providers = useServerInfo().providers!.signature.providers;
    const { control } = useFormContext();
    return (
        <>
            <DefaultSwitchControl
                name="config.jwtAuthorizationGrantAssertionReuseAllowed"
                label={t("jwtAuthorizationGrantAssertionReuseAllowed")}
                labelIcon={t("jwtAuthorizationGrantAssertionReuseAllowedHelp")}
                stringify
            />

            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <Label htmlFor="jwtAuthorizationGrantMaxAllowedAssertionExpiration">{t("jwtAuthorizationGrantMaxAllowedAssertionExpiration")}</Label>
                    <HelpItem
                        helpText={t(
                            "jwtAuthorizationGrantMaxAllowedAssertionExpirationHelp"
                        )}
                        fieldLabelId="jwtAuthorizationGrantMaxAllowedAssertionExpirationHelp"
                    />
                </div>
                <Controller
                    name="config.jwtAuthorizationGrantMaxAllowedAssertionExpirationHelp"
                    defaultValue={300}
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            data-testid="jwtAuthorizationGrantMaxAllowedAssertionExpirationHelp"
                            value={field.value!}
                            onChange={field.onChange}
                            units={["second", "minute", "hour"]}
                        />
                    )}
                />
            </div>
            <SelectField
                name="config.jwtAuthorizationGrantAssertionSignatureAlg"
                label={t("jwtAuthorizationGrantAssertionSignatureAlg")}
                labelIcon={t("jwtAuthorizationGrantAssertionSignatureAlgHelp")}
                options={[
                    { key: "", value: t("algorithmNotSpecified") },
                    ...sortProviders(providers).map(p => ({ key: p, value: p }))
                ]}
                defaultValue=""
            />
            <DefaultSwitchControl
                name="config.jwtAuthorizationGrantLimitAccessTokenExp"
                label={t("jwtAuthorizationGrantLimitAccessTokenExp")}
                labelIcon={t("jwtAuthorizationGrantLimitAccessTokenExpHelp")}
                stringify
            />
        </>
    );
};
