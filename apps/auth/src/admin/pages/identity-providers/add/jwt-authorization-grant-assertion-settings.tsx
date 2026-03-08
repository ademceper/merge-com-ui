import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { HelpItem, SelectField } from "../../../../shared/keycloak-ui-shared";
import { useServerInfo } from "../../../app/providers/server-info/server-info-provider";
import { sortProviders } from "../../../shared/lib/util";
import { DefaultSwitchControl } from "../../../shared/ui/switch-control";
import { TimeSelector } from "../../../shared/ui/time-selector/time-selector";

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
                    <Label htmlFor="jwtAuthorizationGrantMaxAllowedAssertionExpiration">
                        {t("jwtAuthorizationGrantMaxAllowedAssertionExpiration")}
                    </Label>
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
