/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/event-config/EventConfigForm.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import { Switch } from "@merge/ui/components/switch";
import { Separator } from "@merge/ui/components/separator";
import { Label } from "@merge/ui/components/label";
import { Controller, FormProvider, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { TimeSelectorControl } from "../../components/time-selector/TimeSelectorControl";

export type EventsType = "admin" | "user";

type EventConfigFormProps = {
    type: EventsType;
    form: UseFormReturn;
    reset: () => void;
    clear: () => void;
};

export const EventConfigForm = ({ type, form, reset, clear }: EventConfigFormProps) => {
    const { t } = useTranslation();
    const {
        control,
        watch,
        setValue,
        formState: { isDirty }
    } = form;
    const eventKey = type === "admin" ? "adminEventsEnabled" : "eventsEnabled";
    const eventsEnabled: boolean = watch(eventKey);

    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "events-disable-title",
        messageKey: "events-disable-confirm",
        continueButtonLabel: "confirm",
        onConfirm: () => setValue(eventKey, false, { shouldDirty: true })
    });

    return (
        <FormProvider {...form}>
            <DisableConfirm />
            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <Label htmlFor={eventKey}>{t("saveEvents")}</Label>
                    <HelpItem
                        helpText={t(`save-${type}-eventsHelp`)}
                        fieldLabelId="saveEvents"
                    />
                </div>
                <Controller
                    name={eventKey}
                    defaultValue={false}
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center gap-2">
                            <Switch
                                data-testid={eventKey}
                                id={`${eventKey}-switch`}
                                checked={field.value}
                                onCheckedChange={(value) => {
                                    if (!value) {
                                        toggleDisableDialog();
                                    } else {
                                        field.onChange(value);
                                    }
                                }}
                                aria-label={t("saveEvents")}
                            />
                            <span className="text-sm">{field.value ? t("on") : t("off")}</span>
                        </div>
                    )}
                />
            </div>
            {type === "admin" && (
                <DefaultSwitchControl
                    name="adminEventsDetailsEnabled"
                    label={t("includeRepresentation")}
                    labelIcon={t("includeRepresentationHelp")}
                />
            )}
            {eventsEnabled && (
                <TimeSelectorControl
                    name={type === "user" ? "eventsExpiration" : "adminEventsExpiration"}
                    label={t("expiration")}
                    labelIcon={t("expirationHelp")}
                    defaultValue=""
                    units={["minute", "hour", "day"]}
                    controller={{
                        defaultValue: ""
                    }}
                />
            )}
            <div className="flex gap-2">
                <Button
                    type="submit"
                    id={`save-${type}`}
                    data-testid={`save-${type}`}
                    disabled={!isDirty}
                >
                    {t("save")}
                </Button>
                <Button variant="ghost" onClick={reset}>
                    {t("revert")}
                </Button>
            </div>
            <Separator />
            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <Label htmlFor={`clear-${type}-events`}>{type === "user" ? t("clearUserEvents") : t("clearAdminEvents")}</Label>
                    <HelpItem
                        helpText={t(`${type}-clearEventsHelp`)}
                        fieldLabelId={`clear-${type}-events`}
                    />
                </div>
                <Button
                    variant="destructive"
                    id={`clear-${type}-events`}
                    data-testid={`clear-${type}-events`}
                    onClick={() => clear()}
                >
                    {type === "user" ? t("clearUserEvents") : t("clearAdminEvents")}
                </Button>
            </div>
        </FormProvider>
    );
};
