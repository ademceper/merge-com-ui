import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Input } from "@merge-rd/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
import { memo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useServerInfo } from "../../app/providers/server-info/server-info-provider";
import { useIsFeatureEnabled, Feature } from "../../shared/lib/use-is-feature-enabled";
import { sortProviders } from "../../shared/lib/util";
import { FormAccess } from "../../shared/ui/form/form-access";
import { TimeSelector } from "../../shared/ui/time-selector/time-selector";

type TokensTabGeneralSectionProps = {
    onSubmit: () => void;
};

export const TokensTabGeneralSection = memo(function TokensTabGeneralSection({
    onSubmit
}: TokensTabGeneralSectionProps) {
    const { t } = useTranslation();
    const serverInfo = useServerInfo();
    const isFeatureEnabled = useIsFeatureEnabled();
    const { control, register } = useFormContext<RealmRepresentation>();

    const [defaultSigAlgDrpdwnIsOpen, setDefaultSigAlgDrpdwnOpen] = useState(false);

    const defaultSigAlgOptions = sortProviders(
        serverInfo.providers?.signature?.providers ?? {}
    );

    return (
        <FormAccess isHorizontal role="manage-realm" onSubmit={onSubmit}>
            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <label htmlFor="kc-default-signature-algorithm">
                        {t("defaultSigAlg")}
                    </label>
                    <HelpItem
                        helpText={t("defaultSigAlgHelp")}
                        fieldLabelId="algorithm"
                    />
                </div>
                <Controller
                    name="defaultSignatureAlgorithm"
                    defaultValue={"RS256"}
                    control={control}
                    render={({ field }) => (
                        <Select
                            open={defaultSigAlgDrpdwnIsOpen}
                            onOpenChange={setDefaultSigAlgDrpdwnOpen}
                            value={field.value?.toString() ?? "RS256"}
                            onValueChange={v => {
                                field.onChange(v);
                                setDefaultSigAlgDrpdwnOpen(false);
                            }}
                            aria-label={t("defaultSigAlg")}
                            data-testid="select-default-sig-alg"
                        >
                            <SelectTrigger id="kc-default-sig-alg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {defaultSigAlgOptions.map((p, idx) => (
                                    <SelectItem key={`default-sig-alg-${idx}`} value={p}>
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {isFeatureEnabled(Feature.DeviceFlow) && (
                <>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="oAuthDeviceCodeLifespan">
                                {t("oAuthDeviceCodeLifespan")}
                            </label>
                            <HelpItem
                                helpText={t("oAuthDeviceCodeLifespanHelp")}
                                fieldLabelId="oAuthDeviceCodeLifespan"
                            />
                        </div>
                        <Controller
                            name="oauth2DeviceCodeLifespan"
                            defaultValue={0}
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    id="oAuthDeviceCodeLifespan"
                                    data-testid="oAuthDeviceCodeLifespan"
                                    value={field.value || 0}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="oAuthDevicePollingInterval">
                                {t("oAuthDevicePollingInterval")}
                            </label>
                            <HelpItem
                                helpText={t("oAuthDevicePollingIntervalHelp")}
                                fieldLabelId="oAuthDevicePollingInterval"
                            />
                        </div>
                        <Controller
                            name="oauth2DevicePollingInterval"
                            defaultValue={0}
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="number"
                                    id="oAuthDevicePollingInterval"
                                    value={field.value}
                                    min={0}
                                    onChange={event => {
                                        const newValue = Number(
                                            event.currentTarget.value
                                        );
                                        field.onChange(
                                            !Number.isNaN(newValue) ? newValue : 0
                                        );
                                    }}
                                    placeholder={t("oAuthDevicePollingInterval")}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="shortVerificationUri">
                                {t("shortVerificationUri")}
                            </label>
                            <HelpItem
                                helpText={t("shortVerificationUriTooltipHelp")}
                                fieldLabelId="shortVerificationUri"
                            />
                        </div>
                        <Input
                            id="shortVerificationUri"
                            placeholder={t("shortVerificationUri")}
                            {...register("attributes.shortVerificationUri")}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="parRequestUriLifespan">
                                {t("parRequestUriLifespan")}
                            </label>
                            <HelpItem
                                helpText={t("parRequestUriLifespanHelp")}
                                fieldLabelId="parRequestUriLifespan"
                            />
                        </div>
                        <Controller
                            name="attributes.parRequestUriLifespan"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    id="parRequestUriLifespan"
                                    className="par-request-uri-lifespan"
                                    data-testid="par-request-uri-lifespan-input"
                                    aria-label="par-request-uri-lifespan"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </>
            )}
        </FormAccess>
    );
});
