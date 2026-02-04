import { HelpItem, TextControl } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { FormAccess } from "../../components/form/FormAccess";
import { KeyValueInput } from "../../components/key-value-form/KeyValueInput";
import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";
import { TimeSelector } from "../../components/time-selector/TimeSelector";
import { useRealm } from "../../context/realm-context/RealmContext";
import { convertAttributeNameToForm } from "../../util";
import { FormFields } from "../ClientDetails";
import { TokenLifespan } from "./TokenLifespan";

type AdvancedSettingsProps = {
    save: () => void;
    reset: () => void;
    protocol?: string;
    hasConfigureAccess?: boolean;
};

export const AdvancedSettings = ({
    save,
    reset,
    protocol,
    hasConfigureAccess
}: AdvancedSettingsProps) => {
    const { t } = useTranslation();

    const { realmRepresentation: realm } = useRealm();

    const { control } = useFormContext();
    return (
        <FormAccess
            role="manage-realm"
            fineGrainedAccess={hasConfigureAccess}
            isHorizontal
        >
            {protocol !== "openid-connect" && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="assertionLifespan">{t("assertionLifespan")}</Label>
                        <HelpItem
                            helpText={t("assertionLifespanHelp")}
                            fieldLabelId="assertionLifespan"
                        />
                    </div>
                    <Controller
                        name={convertAttributeNameToForm<FormFields>(
                            "attributes.saml.assertion.lifespan"
                        )}
                        defaultValue=""
                        control={control}
                        render={({ field }) => (
                            <TimeSelector
                                units={["minute", "day", "hour"]}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>
            )}
            {protocol === "openid-connect" && (
                <>
                    <TokenLifespan
                        id="accessTokenLifespan"
                        name={convertAttributeNameToForm(
                            "attributes.access.token.lifespan"
                        )}
                        defaultValue={realm?.accessTokenLifespan}
                        units={["minute", "day", "hour"]}
                    />
                    <TokenLifespan
                        id="clientSessionIdle"
                        name={convertAttributeNameToForm(
                            "attributes.client.session.idle.timeout"
                        )}
                        defaultValue={realm?.clientSessionIdleTimeout}
                        units={["minute", "day", "hour"]}
                    />
                    <TokenLifespan
                        id="clientSessionMax"
                        name={convertAttributeNameToForm(
                            "attributes.client.session.max.lifespan"
                        )}
                        defaultValue={realm?.clientSessionMaxLifespan}
                        units={["minute", "day", "hour"]}
                    />
                    <TokenLifespan
                        id="clientOfflineSessionIdle"
                        name={convertAttributeNameToForm(
                            "attributes.client.offline.session.idle.timeout"
                        )}
                        defaultValue={realm?.offlineSessionIdleTimeout}
                        units={["minute", "day", "hour"]}
                    />

                    {realm?.offlineSessionMaxLifespanEnabled && (
                        <TokenLifespan
                            id="clientOfflineSessionMax"
                            name={convertAttributeNameToForm(
                                "attributes.client.offline.session.max.lifespan"
                            )}
                            defaultValue={
                                realm?.offlineSessionMaxLifespanEnabled
                                    ? realm.offlineSessionMaxLifespan
                                    : undefined
                            }
                            units={["minute", "day", "hour"]}
                        />
                    )}
                    <DefaultSwitchControl
                        name={convertAttributeNameToForm<FormFields>(
                            "attributes.tls.client.certificate.bound.access.tokens"
                        )}
                        label={t("oAuthMutual")}
                        labelIcon={t("oAuthMutualHelp")}
                        stringify
                    />
                    <DefaultSwitchControl
                        name={convertAttributeNameToForm<FormFields>(
                            "attributes.require.pushed.authorization.requests"
                        )}
                        label={t("pushedAuthorizationRequestRequired")}
                        labelIcon={t("pushedAuthorizationRequestRequiredHelp")}
                        stringify
                    />
                    <DefaultSwitchControl
                        name={convertAttributeNameToForm<FormFields>(
                            "attributes.client.use.lightweight.access.token.enabled"
                        )}
                        label={t("lightweightAccessToken")}
                        labelIcon={t("lightweightAccessTokenHelp")}
                        stringify
                    />

                    <DefaultSwitchControl
                        name={convertAttributeNameToForm<FormFields>(
                            "attributes.client.introspection.response.allow.jwt.claim.enabled"
                        )}
                        label={t("supportJwtClaimInIntrospectionResponse")}
                        labelIcon={t("supportJwtClaimInIntrospectionResponseHelp")}
                        stringify
                    />
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="acrToLoAMapping">{t("acrToLoAMapping")}</Label>
                            <HelpItem
                                helpText={t("acrToLoAMappingHelp")}
                                fieldLabelId="acrToLoAMapping"
                            />
                        </div>
                        <KeyValueInput
                            label={t("acrToLoAMapping")}
                            name={convertAttributeNameToForm("attributes.acr.loa.map")}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="defaultACRValues">{t("defaultACRValues")}</Label>
                            <HelpItem
                                helpText={t("defaultACRValuesHelp")}
                                fieldLabelId="defaultACRValues"
                            />
                        </div>
                        <MultiLineInput
                            id="defaultACRValues"
                            aria-label="defaultACRValues"
                            name={convertAttributeNameToForm(
                                "attributes.default.acr.values"
                            )}
                            stringify
                        />
                    </div>
                    <TextControl
                        type="text"
                        name={convertAttributeNameToForm("attributes.minimum.acr.value")}
                        label={t("minimumACRValue")}
                        labelIcon={t("minimumACRValueHelp")}
                    />
                </>
            )}
            <div className="flex gap-2">
                <Button variant="secondary" onClick={save} data-testid="OIDCAdvancedSave">
                    {t("save")}
                </Button>
                <Button variant="link" onClick={reset} data-testid="OIDCAdvancedRevert">
                    {t("revert")}
                </Button>
            </div>
        </FormAccess>
    );
};
