/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/custom/SyncSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { Switch } from "@merge/ui/components/switch";
import { FormLabel } from "../../../shared/keycloak-ui-shared";
import { useTranslation } from "react-i18next";
import { HelpItem, TextControl } from "../../../shared/keycloak-ui-shared";

export const SyncSettings = () => {
    const { t } = useTranslation();
    const form = useFormContext();
    const { control, watch } = form;
    const watchPeriodicSync = watch("config.fullSyncPeriod", "-1");
    const watchChangedSync = watch("config.changedSyncPeriod", "-1");

    return (
        <FormProvider {...form}>
            <FormLabel
                name="kc-periodic-full-sync"
                label={t("periodicFullSync")}
                labelIcon={
                    <HelpItem
                        helpText={t("periodicFullSyncHelp")}
                        fieldLabelId="periodicFullSync"
                    />
                }
                hasNoPaddingTop
            >
                <Controller
                    name="config.fullSyncPeriod"
                    defaultValue="-1"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="kc-periodic-full-sync"
                            data-testid="periodic-full-sync"
                            checked={field.value !== "-1"}
                            onCheckedChange={(value) => {
                                field.onChange(value ? "604800" : "-1");
                            }}
                            aria-label={t("periodicFullSync")}
                        />
                    )}
                />
            </FormLabel>
            {watchPeriodicSync !== "-1" && (
                <TextControl
                    name="config.fullSyncPeriod"
                    label={t("fullSyncPeriod")}
                    labelIcon={t("fullSyncPeriodHelp")}
                    type="number"
                    min={-1}
                    defaultValue="604800"
                />
            )}
            <FormLabel
                name="kc-periodic-changed-users-sync"
                label={t("periodicChangedUsersSync")}
                labelIcon={
                    <HelpItem
                        helpText={t("periodicChangedUsersSyncHelp")}
                        fieldLabelId="periodicChangedUsersSync"
                    />
                }
                hasNoPaddingTop
            >
                <Controller
                    name="config.changedSyncPeriod"
                    defaultValue="-1"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="kc-periodic-changed-users-sync"
                            data-testid="periodic-changed-users-sync"
                            checked={field.value !== "-1"}
                            onCheckedChange={(value) => {
                                field.onChange(value ? "86400" : "-1");
                            }}
                            aria-label={t("periodicChangedUsersSync")}
                        />
                    )}
                />
            </FormLabel>
            {watchChangedSync !== "-1" && (
                <TextControl
                    name="config.changedSyncPeriod"
                    label={t("changedUsersSyncPeriod")}
                    labelIcon={t("changedUsersSyncHelp")}
                    type="number"
                    min={-1}
                    defaultValue="86400"
                />
            )}
        </FormProvider>
    );
};
