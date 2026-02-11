import { HelpItem } from "../../../shared/keycloak-ui-shared";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@merge/ui/components/collapsible";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormGroupField } from "../component/FormGroupField";
import { SwitchField } from "../component/SwitchField";
import { TextField } from "../component/TextField";

const promptOptions = {
    unspecified: "",
    none: "none",
    consent: "consent",
    login: "login",
    select_account: "select_account"
};

export const ExtendedNonDiscoverySettings = () => {
    const { t } = useTranslation();
    const { control } = useFormContext();

    const [isExpanded, setIsExpanded] = useState(false);
    const [promptOpen, setPromptOpen] = useState(false);

    return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
                <button type="button" className="font-medium text-sm">
                    {t("advanced")}
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
            <div>
                <SwitchField label="passLoginHint" field="config.loginHint" />
                <SwitchField label="passMaxAge" field="config.passMaxAge" />
                <SwitchField label="passCurrentLocale" field="config.uiLocales" />
                <SwitchField
                    field="config.backchannelSupported"
                    label="backchannelLogout"
                />
                <SwitchField
                    field="config.sendIdTokenOnLogout"
                    label="sendIdTokenOnLogout"
                    defaultValue={"true"}
                />
                <SwitchField
                    field="config.sendClientIdOnLogout"
                    label="sendClientIdOnLogout"
                />
                <SwitchField field="config.disableUserInfo" label="disableUserInfo" />
                <SwitchField field="config.disableNonce" label="disableNonce" />
                <SwitchField
                    field="config.disableTypeClaimCheck"
                    label="disableTypeClaimCheck"
                />
                <TextField field="config.defaultScope" label="scopes" />
                <FormGroupField label="prompt">
                    <Controller
                        name="config.prompt"
                        defaultValue=""
                        control={control}
                        render={({ field }) => (
                            <Select
                                open={promptOpen}
                                onOpenChange={setPromptOpen}
                                value={field.value ?? ""}
                                onValueChange={(v) => {
                                    field.onChange(v);
                                    setPromptOpen(false);
                                }}
                                aria-label={t("prompt")}
                            >
                                <SelectTrigger id="prompt">
                                    <SelectValue placeholder={t("prompts.unspecified")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(promptOptions).map(([key, val]) => (
                                        <SelectItem key={key} value={val}>
                                            {t(`prompts.${key}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormGroupField>
                <SwitchField
                    field="config.acceptsPromptNoneForwardFromClient"
                    label="acceptsPromptNone"
                />
                <SwitchField
                    field="config.requiresShortStateParameter"
                    label="requiresShortStateParameter"
                />
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="allowedClockSkew">{t("allowedClockSkew")}</Label>
                        <HelpItem
                            helpText={t("allowedClockSkewHelp")}
                            fieldLabelId="allowedClockSkew"
                        />
                    </div>
                    <Controller
                        name="config.allowedClockSkew"
                        defaultValue={0}
                        control={control}
                        render={({ field }) => {
                            const v = Number(field.value);
                            return (
                                <Input
                                    type="number"
                                    data-testid="allowedClockSkew"
                                    name="allowedClockSkew"
                                    min={0}
                                    max={2147483}
                                    value={v}
                                    onChange={event => {
                                        const value = Number(event.target.value);
                                        field.onChange(value < 0 ? 0 : value);
                                    }}
                                />
                            );
                        }}
                    />
                </div>
                <TextField field="config.forwardParameters" label="forwardParameters" />
            </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
