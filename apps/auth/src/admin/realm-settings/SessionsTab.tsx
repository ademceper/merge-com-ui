import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormPanel, HelpItem } from "../../shared/keycloak-ui-shared";
import { FixedButtonsGroup } from "../components/form/FixedButtonGroup";
import { FormAccess } from "../components/form/FormAccess";
import { FormGroup } from "../components/form/FormGroup";
import { TimeSelector } from "../components/time-selector/TimeSelector";

type RealmSettingsSessionsTabProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

export const RealmSettingsSessionsTab = ({
    realm,
    save
}: RealmSettingsSessionsTabProps) => {
    const { t } = useTranslation();

    const { control, handleSubmit, formState, reset } =
        useFormContext<RealmRepresentation>();

    const offlineSessionMaxEnabled = useWatch({
        control,
        name: "offlineSessionMaxLifespanEnabled"
    });

    return (
        <div className="pt-0">
            <FormAccess
                isHorizontal
                role="manage-realm"
                className="mt-6 space-y-6"
                onSubmit={handleSubmit(save)}
            >
                <FormPanel title={t("SSOSessionSettings")}>
                    <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="SSOSessionIdle" className="flex items-center gap-1">
                            {t("SSOSessionIdle")}
                            <HelpItem
                                helpText={t("ssoSessionIdle")}
                                fieldLabelId="SSOSessionIdle"
                            />
                        </Label>
                        <Controller
                            name="ssoSessionIdleTimeout"
                            defaultValue={realm.ssoSessionIdleTimeout}
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-sso-session-idle"
                                    data-testid="sso-session-idle-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="SSOSessionMax" className="flex items-center gap-1">
                            {t("SSOSessionMax")}
                            <HelpItem
                                helpText={t("ssoSessionMax")}
                                fieldLabelId="SSOSessionMax"
                            />
                        </Label>
                        <Controller
                            name="ssoSessionMaxLifespan"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-sso-session-max"
                                    data-testid="sso-session-max-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="SSOSessionIdleRememberMe" className="flex items-center gap-1">
                            {t("SSOSessionIdleRememberMe")}
                            <HelpItem
                                helpText={t("ssoSessionIdleRememberMe")}
                                fieldLabelId="SSOSessionIdleRememberMe"
                            />
                        </Label>
                        <Controller
                            name="ssoSessionIdleTimeoutRememberMe"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-sso-session-idle-remember-me"
                                    data-testid="sso-session-idle-remember-me-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="SSOSessionMaxRememberMe" className="flex items-center gap-1">
                            {t("SSOSessionMaxRememberMe")}
                            <HelpItem
                                helpText={t("ssoSessionMaxRememberMe")}
                                fieldLabelId="SSOSessionMaxRememberMe"
                            />
                        </Label>
                        <Controller
                            name="ssoSessionMaxLifespanRememberMe"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-sso-session-max-remember-me"
                                    data-testid="sso-session-max-remember-me-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>
                    </div>
                </FormPanel>
                <FormPanel title={t("clientSessionSettings")}>
                    <div className="space-y-4">
                    <FormGroup
                        label={t("clientSessionIdle")}
                        fieldId="clientSessionIdle"
                        labelIcon={
                            <HelpItem
                                helpText={t("clientSessionIdleHelp")}
                                fieldLabelId="clientSessionIdle"
                            />
                        }
                    >
                        <Controller
                            name="clientSessionIdleTimeout"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-client-session-idle"
                                    data-testid="client-session-idle-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </FormGroup>

                    <FormGroup
                        label={t("clientSessionMax")}
                        fieldId="clientSessionMax"
                        labelIcon={
                            <HelpItem
                                helpText={t("clientSessionMaxHelp")}
                                fieldLabelId="clientSessionMax"
                            />
                        }
                    >
                        <Controller
                            name="clientSessionMaxLifespan"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-client-session-max"
                                    data-testid="client-session-max-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </FormGroup>
                    </div>
                </FormPanel>
                <FormPanel title={t("offlineSessionSettings")}>
                    <div className="space-y-4">
                    <FormGroup
                        label={t("offlineSessionIdle")}
                        fieldId="offlineSessionIdle"
                        labelIcon={
                            <HelpItem
                                helpText={t("offlineSessionIdleHelp")}
                                fieldLabelId="offlineSessionIdle"
                            />
                        }
                    >
                        <Controller
                            name="offlineSessionIdleTimeout"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-offline-session-idle"
                                    data-testid="offline-session-idle-input"
                                    aria-label="offline-session-idle-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </FormGroup>

                    <FormGroup
                        label={t("clientOfflineSessionIdle")}
                        fieldId="clientOfflineSessionIdle"
                        labelIcon={
                            <HelpItem
                                helpText={t("clientOfflineSessionIdleHelp")}
                                fieldLabelId="clientOfflineSessionIdle"
                            />
                        }
                    >
                        <Controller
                            name="clientOfflineSessionIdleTimeout"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-client-offline-session-idle"
                                    data-testid="client-offline-session-idle-input"
                                    aria-label="client-offline-session-idle-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </FormGroup>

                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <Label htmlFor="kc-offline-session-max" className="text-sm font-medium">{t("offlineSessionMaxLimited")}</Label>
                            <HelpItem
                                helpText={t("offlineSessionMaxLimitedHelp")}
                                fieldLabelId="offlineSessionMaxLimited"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Controller
                                name="offlineSessionMaxLifespanEnabled"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => (
                                    <>
                                        <span className="text-sm text-muted-foreground">
                                            {field.value ? t("on") : t("off")}
                                        </span>
                                        <Switch
                                            id="kc-offline-session-max"
                                            data-testid="offline-session-max-switch"
                                            aria-label={t("offlineSessionMaxLimited")}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </>
                                )}
                            />
                        </div>
                    </div>
                    {offlineSessionMaxEnabled && (
                        <FormGroup
                            label={t("offlineSessionMax")}
                            fieldId="offlineSessionMax"
                            id="offline-session-max-label"
                            labelIcon={
                                <HelpItem
                                    helpText={t("offlineSessionMaxHelp")}
                                    fieldLabelId="offlineSessionMax"
                                />
                            }
                        >
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
                        </FormGroup>
                    )}
                    {offlineSessionMaxEnabled && (
                        <FormGroup
                            label={t("clientOfflineSessionMax")}
                            fieldId="clientOfflineSessionMax"
                            id="client-offline-session-max-label"
                            labelIcon={
                                <HelpItem
                                    helpText={t("clientOfflineSessionMaxHelp")}
                                    fieldLabelId="clientOfflineSessionMax"
                                />
                            }
                        >
                            <Controller
                                name="clientOfflineSessionMaxLifespan"
                                control={control}
                                render={({ field }) => (
                                    <TimeSelector
                                        className="kc-client-offline-session-max"
                                        data-testid="client-offline-session-max-input"
                                        value={field.value!}
                                        onChange={field.onChange}
                                        units={["minute", "hour", "day"]}
                                    />
                                )}
                        />
                    </FormGroup>
                    )}
                    </div>
                </FormPanel>
                <FormPanel title={t("loginSettings")}>
                    <div className="space-y-4">
                    <FormGroup
                        label={t("loginTimeout")}
                        id="kc-login-timeout-label"
                        fieldId="offlineSessionIdle"
                        labelIcon={
                            <HelpItem
                                helpText={t("loginTimeoutHelp")}
                                fieldLabelId="loginTimeout"
                            />
                        }
                    >
                        <Controller
                            name="accessCodeLifespanLogin"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-login-timeout"
                                    data-testid="login-timeout-input"
                                    aria-label="login-timeout-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </FormGroup>
                    <FormGroup
                        label={t("loginActionTimeout")}
                        fieldId="loginActionTimeout"
                        id="login-action-timeout-label"
                        labelIcon={
                            <HelpItem
                                helpText={t("loginActionTimeoutHelp")}
                                fieldLabelId="loginActionTimeout"
                            />
                        }
                    >
                        <Controller
                            name="accessCodeLifespanUserAction"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-login-action-timeout"
                                    data-testid="login-action-timeout-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </FormGroup>
                    </div>
                </FormPanel>
                <div className="flex gap-2 pt-2">
                    <FixedButtonsGroup
                        name="sessions-tab"
                        reset={() => reset(realm)}
                        isSubmit
                        isDisabled={!formState.isDirty}
                    />
                </div>
            </FormAccess>
        </div>
    );
};
