import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useIsFeatureEnabled, Feature } from "../../shared/lib/use-is-feature-enabled";
import { beerify } from "../../shared/lib/util";
import { FixedButtonsGroup } from "../../shared/ui/form/fixed-button-group";
import { FormAccess } from "../../shared/ui/form/form-access";
import { TimeSelector } from "../../shared/ui/time-selector/time-selector";

type TokensTabActionSectionProps = {
    realm: RealmRepresentation;
    onSubmit: () => void;
};

export const TokensTabActionSection = memo(function TokensTabActionSection({
    realm,
    onSubmit
}: TokensTabActionSectionProps) {
    const { t } = useTranslation();
    const isFeatureEnabled = useIsFeatureEnabled();
    const { control, reset, formState } = useFormContext<RealmRepresentation>();

    return (
        <FormAccess isHorizontal role="manage-realm" className="mt-4" onSubmit={onSubmit}>
            <div className="space-y-2" id="kc-user-initiated-action-lifespan">
                <div className="flex items-center gap-1">
                    <label htmlFor="userInitiatedActionLifespan">
                        {t("userInitiatedActionLifespan")}
                    </label>
                    <HelpItem
                        helpText={t("userInitiatedActionLifespanHelp")}
                        fieldLabelId="userInitiatedActionLifespan"
                    />
                </div>
                <Controller
                    name="actionTokenGeneratedByUserLifespan"
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            className="kc-user-initiated-action-lifespan"
                            data-testid="user-initiated-action-lifespan"
                            aria-label="user-initiated-action-lifespan"
                            value={field.value!}
                            onChange={field.onChange}
                            units={["minute", "hour", "day"]}
                        />
                    )}
                />
            </div>
            <div className="space-y-2" id="default-admin-initiated-label">
                <div className="flex items-center gap-1">
                    <label htmlFor="defaultAdminInitiated">
                        {t("defaultAdminInitiated")}
                    </label>
                    <HelpItem
                        helpText={t("defaultAdminInitiatedActionLifespanHelp")}
                        fieldLabelId="defaultAdminInitiated"
                    />
                </div>
                <Controller
                    name="actionTokenGeneratedByAdminLifespan"
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            className="kc-default-admin-initiated"
                            data-testid="default-admin-initated-input"
                            aria-label="default-admin-initated-input"
                            value={field.value!}
                            onChange={field.onChange}
                            units={["minute", "hour", "day"]}
                        />
                    )}
                />
            </div>
            <h1 className="kc-override-action-tokens-subtitle text-xl font-semibold">
                {t("overrideActionTokens")}
            </h1>
            <div className="space-y-2" id="email-verification">
                <div className="flex items-center gap-1">
                    <label htmlFor="emailVerification">{t("emailVerification")}</label>
                    <HelpItem
                        helpText={t("emailVerificationHelp")}
                        fieldLabelId="emailVerification"
                    />
                </div>
                <Controller
                    name={`attributes.${beerify(
                        "actionTokenGeneratedByUserLifespan.verify-email"
                    )}`}
                    defaultValue=""
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            className="kc-email-verification"
                            data-testid="email-verification-input"
                            value={field.value}
                            onChange={value => field.onChange(value.toString())}
                            units={["minute", "hour", "day"]}
                        />
                    )}
                />
            </div>
            <div className="space-y-2" id="idp-acct-label">
                <div className="flex items-center gap-1">
                    <label htmlFor="idpAccountEmailVerification">
                        {t("idpAccountEmailVerification")}
                    </label>
                    <HelpItem
                        helpText={t("idpAccountEmailVerificationHelp")}
                        fieldLabelId="idpAccountEmailVerification"
                    />
                </div>
                <Controller
                    name={`attributes.${beerify(
                        "actionTokenGeneratedByUserLifespan.idp-verify-account-via-email"
                    )}`}
                    defaultValue={""}
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            className="kc-idp-email-verification"
                            data-testid="idp-email-verification-input"
                            value={field.value}
                            onChange={field.onChange}
                            units={["minute", "hour", "day"]}
                        />
                    )}
                />
            </div>
            <div className="space-y-2" id="forgot-password-label">
                <div className="flex items-center gap-1">
                    <label htmlFor="forgotPassword">{t("forgotPassword")}</label>
                    <HelpItem
                        helpText={t("forgotPasswordHelp")}
                        fieldLabelId="forgotPassword"
                    />
                </div>
                <Controller
                    name={`attributes.${beerify(
                        "actionTokenGeneratedByUserLifespan.reset-credentials"
                    )}`}
                    defaultValue={""}
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            className="kc-forgot-pw"
                            data-testid="forgot-pw-input"
                            value={field.value}
                            onChange={field.onChange}
                            units={["minute", "hour", "day"]}
                        />
                    )}
                />
            </div>
            <div className="space-y-2" id="execute-actions">
                <div className="flex items-center gap-1">
                    <label htmlFor="executeActions">{t("executeActions")}</label>
                    <HelpItem
                        helpText={t("executeActionsHelp")}
                        fieldLabelId="executeActions"
                    />
                </div>
                <Controller
                    name={`attributes.${beerify(
                        "actionTokenGeneratedByUserLifespan.execute-actions"
                    )}`}
                    defaultValue={""}
                    control={control}
                    render={({ field }) => (
                        <TimeSelector
                            className="kc-execute-actions"
                            data-testid="execute-actions-input"
                            value={field.value}
                            onChange={field.onChange}
                            units={["minute", "hour", "day"]}
                        />
                    )}
                />
            </div>
            {!isFeatureEnabled(Feature.OpenId4VCI) && (
                <FixedButtonsGroup
                    name="tokens-tab"
                    isSubmit
                    isDisabled={!formState.isDirty}
                    reset={() => reset(realm)}
                />
            )}
        </FormAccess>
    );
});
