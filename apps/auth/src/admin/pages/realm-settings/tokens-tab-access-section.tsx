import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { memo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useWhoAmI } from "../../app/providers/whoami/who-am-i";
import { FormAccess } from "../../shared/ui/form/form-access";
import { TimeSelector, toHumanFormat } from "../../shared/ui/time-selector/time-selector";

type TokensTabAccessSectionProps = {
    realm: RealmRepresentation;
    onSubmit: () => void;
};

export const TokensTabAccessSection = memo(function TokensTabAccessSection({
    realm,
    onSubmit
}: TokensTabAccessSectionProps) {
    const { t } = useTranslation();
    const { whoAmI } = useWhoAmI();
    const { control } = useFormContext<RealmRepresentation>();

    const offlineSessionMaxEnabled = useWatch({
        control,
        name: "offlineSessionMaxLifespanEnabled",
        defaultValue: realm.offlineSessionMaxLifespanEnabled
    });

    const ssoSessionIdleTimeout = useWatch({
        control,
        name: "ssoSessionIdleTimeout",
        defaultValue: 36000
    });

    return (
        <FormAccess isHorizontal role="manage-realm" className="mt-4" onSubmit={onSubmit}>
            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <label htmlFor="accessTokenLifespan">
                        {t("accessTokenLifespan")}
                    </label>
                    <HelpItem
                        helpText={t("accessTokenLifespanHelp")}
                        fieldLabelId="accessTokenLifespan"
                    />
                </div>
                <Controller
                    name="accessTokenLifespan"
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            validated={
                                field.value! > ssoSessionIdleTimeout!
                                    ? "warning"
                                    : "default"
                            }
                            className="kc-access-token-lifespan"
                            data-testid="access-token-lifespan-input"
                            aria-label="access-token-lifespan"
                            value={field.value!}
                            onChange={field.onChange}
                            units={["minute", "hour", "day"]}
                        />
                    )}
                />
                <p className="text-sm text-muted-foreground">
                    {t("recommendedSsoTimeout", {
                        time: toHumanFormat(ssoSessionIdleTimeout!, whoAmI.locale)
                    })}
                </p>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <label htmlFor="accessTokenLifespanImplicitFlow">
                        {t("accessTokenLifespanImplicitFlow")}
                    </label>
                    <HelpItem
                        helpText={t("accessTokenLifespanImplicitFlow")}
                        fieldLabelId="accessTokenLifespanImplicitFlow"
                    />
                </div>
                <Controller
                    name="accessTokenLifespanForImplicitFlow"
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            className="kc-access-token-lifespan-implicit"
                            data-testid="access-token-lifespan-implicit-input"
                            value={field.value!}
                            onChange={field.onChange}
                            units={["minute", "hour", "day"]}
                        />
                    )}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <label htmlFor="clientLoginTimeout">{t("clientLoginTimeout")}</label>
                    <HelpItem
                        helpText={t("clientLoginTimeoutHelp")}
                        fieldLabelId="clientLoginTimeout"
                    />
                </div>
                <Controller
                    name="accessCodeLifespan"
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            className="kc-client-login-timeout"
                            data-testid="client-login-timeout-input"
                            aria-label="client-login-timeout"
                            value={field.value!}
                            onChange={field.onChange}
                            units={["minute", "hour", "day"]}
                        />
                    )}
                />
            </div>

            {offlineSessionMaxEnabled && (
                <div className="space-y-2" id="offline-session-max-label">
                    <div className="flex items-center gap-1">
                        <label htmlFor="offlineSessionMax">
                            {t("offlineSessionMax")}
                        </label>
                        <HelpItem
                            helpText={t("offlineSessionMaxHelp")}
                            fieldLabelId="offlineSessionMax"
                        />
                    </div>
                    <Controller
                        name="offlineSessionMaxLifespan"
                        control={control}
                        render={({ field }) => (
                            <TimeSelector
                                className="kc-offline-session-max"
                                data-testid="offline-session-max-input"
                                value={field.value!}
                                onChange={field.onChange}
                                units={["minute", "hour", "day"]}
                            />
                        )}
                    />
                </div>
            )}
        </FormAccess>
    );
});
